require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// JWT Secret (in production, use a proper secret from environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'uploads', req.body.gameName);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Rename HTML files to index.html for consistent access
        if (file.fieldname === 'html') {
            cb(null, 'index.html');
        } else if (file.fieldname === 'css') {
            cb(null, 'style.css');
        } else if (file.fieldname === 'js') {
            cb(null, 'script.js');
        } else {
            cb(null, file.originalname);
        }
    }
});

const upload = multer({ storage });

// Admin login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    // In production, use proper password hashing and database lookup
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).json({ error: "Invalid credentials" });
    }
});

// Game upload endpoint
app.post('/api/upload', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'html', maxCount: 1 },
    { name: 'css', maxCount: 1 },
    { name: 'js', maxCount: 1 }
]), (req, res) => {
    res.json({ 
        message: `Game "${req.body.gameName}" uploaded successfully!`,
        gameName: req.body.gameName
    });
});

// Get list of available games
app.get('/api/games', (req, res) => {
    const gamesDir = path.join(__dirname, 'uploads');
    
    try {
        const gameFolders = fs.readdirSync(gamesDir)
            .filter(file => fs.statSync(path.join(gamesDir, file)).isDirectory());
        
        const games = gameFolders.map(folder => {
            const files = fs.readdirSync(path.join(gamesDir, folder));
            const imageFile = files.find(file => 
                ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(path.extname(file).toLowerCase()));
            
            return {
                name: folder,
                image: imageFile || 'default.jpg'
            };
        });

        res.json(games);
    } catch (error) {
        console.error("Error reading games directory:", error);
        res.status(500).json({ error: "Could not load games" });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Uploads directory: ${path.join(__dirname, 'uploads')}`);
});