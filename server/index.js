require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const app = express();

// Security middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Fixed CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Fixed file upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const gameName = req.body.gameName?.replace(/[^\w-]/g, '');
        if (!gameName) return cb(new Error('Invalid game name'));
        
        const dir = path.join(__dirname, 'uploads', gameName);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        let filename;
        
        switch(file.fieldname) {
            case 'image':
                filename = `cover${ext}`;
                break;
            case 'html':
                filename = 'index.html';
                break;
            case 'css':
                filename = 'style.css';
                break;
            case 'js':
                filename = 'script.js';
                break;
            default:
                filename = file.originalname;
        }
        cb(null, filename);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Fixed auth middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.sendStatus(401);
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Routes
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === process.env.ADMIN_USERNAME && 
        password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign(
            { username }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );
        return res.json({ token });
    }
    res.status(401).json({ error: "Invalid credentials" });
});

app.post('/api/upload', authenticateToken, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'html', maxCount: 1 },
    { name: 'css', maxCount: 1 },
    { name: 'js', maxCount: 1 }
]), (req, res) => {
    if (!req.body.gameName) {
        return res.status(400).json({ error: "Game name is required" });
    }
    res.json({ 
        message: `Game "${req.body.gameName}" uploaded successfully`,
        gameName: req.body.gameName
    });
});

app.get('/api/games', (req, res) => {
    try {
        const gamesDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(gamesDir)) {
            return res.json([]);
        }
        
        const games = fs.readdirSync(gamesDir)
            .filter(file => fs.statSync(path.join(gamesDir, file)).isDirectory())
            .map(folder => {
                const files = fs.readdirSync(path.join(gamesDir, folder));
                const image = files.find(f => 
                    /\.(jpg|jpeg|png|gif|webp)$/i.test(f)) || 'default.jpg';
                
                return { name: folder, image };
            });
            
        res.json(games);
    } catch (error) {
        console.error("Error fetching games:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Uploads directory: ${path.join(__dirname, 'uploads')}`);
});
