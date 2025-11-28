const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 3000;

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'sridhar',
    database: 'project',
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from the "public" folder
app.use('/uploads', express.static('uploads')); // Serve uploaded images

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// Routes
// Signup route
app.post('/api/dupesignin', (req, res) => {
    const { username, email, password } = req.body;
    const query = 'INSERT INTO user (username, email, password) VALUES (?, ?, ?)';
    db.query(query, [username, email, password], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Signup successful' });
    });
});

// Get user data
app.get('/api/user/:id', (req, res) => {
    const userId = req.params.id;
    const query = 'SELECT * FROM user WHERE id = ?';
    db.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(results[0]);
    });
});

// Update user data
app.put('/api/user/:id', upload.single('profileImage'), (req, res) => {
    const userId = req.params.id;
    const { bio } = req.body;
    const profileImage = req.file ? `/uploads/${req.file.filename}` : null;

    let query = 'UPDATE user SET bio = ?';
    const params = [bio];

    if (profileImage) {
        query += ', profile_image = ?';
        params.push(profileImage);
    }

    query += ' WHERE id = ?';
    params.push(userId);

    db.query(query, params, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Profile updated successfully' });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});