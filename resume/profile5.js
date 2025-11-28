const express = require('express');
const mysql = require('mysql2/promise');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = 3055;

// Setup MySQL Connection (Use Pooling for better performance)
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'sridhar',
    database: 'project',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Setup Session Middleware
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Setup Multer (For Image Uploads)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Signup API
app.post('/signup', upload.single('profile_pic'), async (req, res) => {
    const { name, email, password, bio } = req.body;
    const profilePic = req.file ? `/uploads/${req.file.filename}` : '/uploads/default.jpg';

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    try {
        const [results] = await db.query('SELECT email FROM users WHERE email = ?', [email]);

        if (results.length > 0) {
            return res.status(400).json({ success: false, message: 'Email already exists! Try logging in.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const insertQuery = `INSERT INTO users (name, email, password, bio, profile_pic) VALUES (?, ?, ?, ?, ?)`;

        await db.query(insertQuery, [name, email, hashedPassword, bio || '', profilePic]);

        req.session.email = email;

        res.status(201).json({ success: true, message: 'Signup successful!', redirect: '/profile' });

    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ success: false, message: 'An error occurred. Try again later.' });
    }
});

// Profile API
app.get('/profile', async (req, res) => {
    if (!req.session.email) {
        return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
    }

    try {
        const [user] = await db.query('SELECT name, email, bio, profile_pic FROM users WHERE email = ?', [req.session.email]);

        if (user.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        res.json({ success: true, user: user[0] });
    } catch (error) {
        console.error('❌ Error fetching profile:', error);
        res.status(500).json({ success: false, message: 'Database error. Try again later.' });
    }
});

// Serve Uploaded Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start Server
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}/`);
});
