const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const port = 3000;

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'sridhar',
  database: 'sridhar'
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1); // Exit the process if the database connection fails
  }
  console.log('Connected to MySQL Database!');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files (HTML, CSS, JS, images)
app.use(express.static(__dirname));

// ✅ Serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'signin.html'));
});

// ✅ Serve dashboard page
app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'welcome.html'));
});

// ✅ Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const query = 'SELECT * FROM userdetail WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
    }

    if (results.length === 0) {
      return res.status(400).json({ success: false, message: 'User not found. Please register.' });
    }

    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing password:', err);
        return res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
      }

      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
      }

      // Login successful
      res.status(200).json({ 
        success: true, 
        message: `Login successful! Welcome, ${user.name}`, 
        email: user.email // Include the user's email in the response
      });
    });
  });
});

// ✅ Route to fetch user data by email
app.post('/getUser', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }

  const query = 'SELECT name FROM userdetail WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = results[0];
    res.status(200).json({ success: true, name: user.name });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/`);
});
