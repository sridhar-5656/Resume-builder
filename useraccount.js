// const express = require('express');
// const bodyParser = require('body-parser');
// const mysql = require('mysql2');
// const path = require('path');
// const app = express();
// const PORT = 5000;

// // MySQL connection
// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: 'sridhar',
//   database: 'user_profiles'
// });

// db.connect(err => {
//   if (err) throw err;
//   console.log('✅ Connected to MySQL');

//   db.query(`
//     CREATE TABLE IF NOT EXISTS profiles (
//       id INT AUTO_INCREMENT PRIMARY KEY,
//       name VARCHAR(255),
//       email VARCHAR(255),
//       image LONGTEXT
//     )
//   `, (err) => {
//     if (err) throw err;
//     console.log('✅ Table ready');
//   });
// });

// // Middleware
// app.use(bodyParser.json({ limit: '5mb' }));

// // Serve only useraccount.html
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'useraccount.html'));
// });

// // API endpoint
// app.post('/api/profile', (req, res) => {
//   const { name, email, image } = req.body;
//   if (!name || !email || !image) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   const sql = 'INSERT INTO profiles (name, email, image) VALUES (?, ?, ?)';
//   db.query(sql, [name, email, image], (err, result) => {
//     if (err) return res.status(500).json({ message: "Database error", error: err });
//     res.status(201).json({ 
//       message: "Profile saved successfully!",
//       id: result.insertId 
//     });
//   });
// });

// // Server start
// app.listen(PORT, () => {
//   console.log(`🚀 Server running at http://localhost:${PORT}/`);
// });





const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');
const app = express();
const PORT = 6000;

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'sridhar',
  database: 'user_profiles'
});

db.connect(err => {
  if (err) throw err;
  console.log('✅ Connected to MySQL');

  db.query(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255),
      image LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) throw err;
    console.log('✅ Table ready');
  });
});

// Middleware
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit for image data
app.use(express.static(path.join(__dirname))); // Serve files from root

// Serve useraccount.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'resume','useraccount.html'));
});

// API endpoint to save profile
app.post('/api/profile', (req, res) => {
  const { name, email, image } = req.body;
  if (!name || !email || !image) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = 'INSERT INTO profiles (name, email, image) VALUES (?, ?, ?)';
  db.query(sql, [name, email, image], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.status(201).json({ 
      message: "Profile saved successfully!",
      id: result.insertId 
    });
  });
});

// API endpoint to get all profiles
app.get('/api/profiles', (req, res) => {
  const sql = 'SELECT * FROM profiles ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});

// Server start
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}/`);
});