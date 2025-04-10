// Auth Constants
const AUTH_TOKEN_KEY = 'admin-auth-token';

// Login Functionality
if (document.getElementById('login-btn')) {
    document.getElementById('login-btn').addEventListener('click', async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            if (response.ok) {
                const { token } = await response.json();
                localStorage.setItem(AUTH_TOKEN_KEY, token);
                window.location.href = 'admin.html';
            } else {
                document.getElementById('error-msg').textContent = "Invalid credentials!";
            }
        } catch (error) {
            console.error('Login error:', error);
            document.getElementById('error-msg').textContent = "Login failed. Try again later.";
        }
    });
}

// Admin Dashboard Functionality
if (document.getElementById('upload-btn')) {
    // Check authentication
    if (!localStorage.getItem(AUTH_TOKEN_KEY)) {
        window.location.href = 'login.html';
    }

    // Logout button
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        window.location.href = 'login.html';
    });

    // File upload
    document.getElementById('upload-btn').addEventListener('click', async () => {
        const gameName = document.getElementById('game-name').value.trim();
        if (!gameName) {
            alert('Please enter a game name');
            return;
        }

        const formData = new FormData();
        formData.append('gameName', gameName);
        
        // Append files if they exist
        ['image', 'html', 'css', 'js'].forEach(type => {
            const fileInput = document.getElementById(`game-${type}`);
            if (fileInput.files[0]) {
                formData.append(type, fileInput.files[0]);
            }
        });

        try {
            const response = await fetch('http://localhost:3000/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`
                },
                body: formData
            });

            const result = await response.json();
            document.getElementById('upload-status').textContent = result.message;
            
            if (response.ok) {
                // Clear form after successful upload
                document.getElementById('game-name').value = '';
                ['image', 'html', 'css', 'js'].forEach(type => {
                    document.getElementById(`game-${type}`).value = '';
                });
            }
        } catch (error) {
            console.error('Upload error:', error);
            document.getElementById('upload-status').textContent = 'Upload failed. Please try again.';
        }
    });
}