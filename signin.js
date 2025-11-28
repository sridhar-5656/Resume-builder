const express = require('express');
const mysql   = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt  = require('bcryptjs');
const path    = require('path');

const app = express();
const port = 5000;

// ─── Database Connection ───────────────────────────────────────────────────────
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'sridhar',
  database: 'project'
});
db.connect(err => {
  if (err) {
    console.error('❌ MySQL Connection Error:', err);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL Database!');
});

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // serve .html, .css, .js, etc.

// ─── Routes ────────────────────────────────────────────────────────────────────

// 1) Landing page (e.g. signup or welcome)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// 2) Login form
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// 3) Dashboard (your “welcome” page)
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// 4) Details page (if you still need it)
app.get('/details', (req, res) => {
  res.sendFile(path.join(__dirname, 'details.html'));
});

// 5) Sign‑up endpoint
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }
  try {
    const [exists] = await db.promise().query(
      'SELECT email FROM users WHERE email = ?', [email]
    );
    if (exists.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Email already exists! Try logging in.' });
    }
    const hashed = await bcrypt.hash(password, 10);
    await db.promise().query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashed]
    );
    res.status(201).json({
      success: true,
      message: 'Sign‑up successful! Redirecting to login…',
      redirect: '/login'
    });
  } catch (err) {
    console.error('❌ Error in /signup:', err);
    res.status(500).json({ success: false, message: 'Server error. Try again later.' });
  }
});

// 6) Login endpoint (now redirects to /dashboard)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }
  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM users WHERE email = ?', [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    // successful login → send redirect to /dashboard
    res.json({ success: true, message: 'Login successful! Redirecting…', redirect: '/dashboard' });
  } catch (err) {
    console.error('❌ Error in /login:', err);
    res.status(500).json({ success: false, message: 'Server error. Try again later.' });
  }
});

// 7) (Optional) Fetch users for details.html
app.get('/getUsers', async (req, res) => {
  try {
    const [users] = await db.promise().query('SELECT id, name, email FROM users');
    res.json(users);
  } catch (err) {
    console.error('❌ Error in /getUsers:', err);
    res.status(500).json({ success: false, message: 'Server error. Try again later.' });
  }
});

// 8) (Optional) Update user
app.post('/updateUser', async (req, res) => {
  const { id, name } = req.body;
  if (!id || !name) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }
  try {
    await db.promise().query('UPDATE users SET name = ? WHERE id = ?', [name, id]);
    res.json({ success: true, message: 'User updated successfully!' });
  } catch (err) {
    console.error('❌ Error in /updateUser:', err);
    res.status(500).json({ success: false, message: 'Server error. Try again later.' });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}/`);
});
