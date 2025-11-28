// const express = require('express');
// const mysql = require('mysql');
// const bodyParser = require('body-parser');
// const bcrypt = require('bcryptjs');
// const path = require('path');

// const app = express();
// const port = 3025;

// // Database connection
// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'sridhar',
//     database: 'sridhar'
// });

// db.connect((err) => {
//     if (err) {
//         console.error('Error connecting to MySQL:', err);
//         process.exit(1);
//     }
//     console.log('Connected to MySQL Database!');
// });

// // Middleware
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname)));

// // Serve login page
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'login.html'));
// });

// // Serve user details pagein
// app.get('/details', (req, res) => {
//     res.sendFile(path.join(__dirname, 'details.html'));
// });

// // Sign-in route (store user details)
// app.post('/dupesignin', async (req, res) => {
//     const { name, email, password} = req.body;

//     if (!name || !email || !password) {
//         return res.status(400).json({ success: false, message: 'All fields are required.' });
//     }

//     try {
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';

//         db.query(query, [name, email, hashedPassword], (err) => {
//             if (err) {
//                 console.error('Error inserting user:', err);
//                 return res.status(500).json({ success: false, message: 'Database error. Try again later.' });
//             }
//             res.status(201).json({ success: true, message: 'Sign-in successful! You can now log in.' });
//         });
//     } catch (err) {
//         console.error('Error hashing password:', err);
//         res.status(500).json({ success: false, message: 'An error occurred. Try again later.' });
//     }
// });

// // Login route (authenticate user)
// app.post('/login', (req, res) => {
//     const { email, password } = req.body;

//     if (!email || !password) {
//         return res.status(400).json({ success: false, message: 'Email and password are required.' });
//     }

//     const query = 'SELECT * FROM users WHERE email = ?';
//     db.query(query, [email], async (err, results) => {
//         if (err) {
//             console.error('Database error:', err);
//             return res.status(500).json({ success: false, message: 'Database error. Try again later.' });
//         }

//         if (results.length === 0) {
//             return res.status(401).json({ success: false, message: 'Invalid email or password.' });
//         }

//         const user = results[0];
//         const passwordMatch = await bcrypt.compare(password, user.password);

//         if (passwordMatch) {
//             res.json({ success: true, message: 'Login successful!', redirect: '/welcome' });
//         } else {
//             res.status(401).json({ success: false, message: 'Invalid email or password.' });
//         }
//     });
// });

// // Fetch all users (for details page)
// app.get('/getUsers', (req, res) => {
//     const query = 'SELECT id, name, email FROM users';

//     db.query(query, (err, results) => {
//         if (err) {
//             console.error('Error fetching users:', err);
//             return res.status(500).json({ success: false, message: 'Database error. Try again later.' });
//         }
//         res.json(results);
//     });
// });

// // Update user details
// app.post('/updateUser', (req, res) => {
//     const { id, name} = req.body;

//     if (!id || !name) {
//         return res.status(400).json({ success: false, message: 'All fields are required.' });
//     }

//     const query = 'UPDATE users SET name = ? WHERE id = ?';
//     db.query(query, [name, id], (err) => {
//         if (err) {
//             console.error('Error updating user:', err);
//             return res.status(500).json({ success: false, message: 'Database error. Try again later.' });
//         }
//         res.json({ success: true, message: 'User updated successfully!' });
//     });
// });

// // Start server
// app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}/`);
// });




const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const port = 7000;

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'sridhar',
    database: 'project'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL Database!');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Serve login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'resume','login.html'));
});

// Serve user details page
app.get('/details', (req, res) => {
    res.sendFile(path.join(__dirname, 'details.html'));
});

// Sign-in route (store user details)
app.post('/dupesignin', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    try {
        // Check if the email already exists
        const checkQuery = 'SELECT email FROM users WHERE email = ?';
        db.query(checkQuery, [email], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, message: 'Database error. Try again later.' });
            }

            if (results.length > 0) {
                return res.status(400).json({ success: false, message: 'Email already exists! Try logging in.' });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);
            const insertQuery = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';

            db.query(insertQuery, [name, email, hashedPassword], (insertErr) => {
                if (insertErr) {
                    console.error('Error inserting user:', insertErr);
                    return res.status(500).json({ success: false, message: 'Database error. Try again later.' });
                }

                res.status(201).json({ success: true, message: 'Sign-in successful! You can now log in.', redirect: '/resume/details' });
            });
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).json({ success: false, message: 'An error occurred. Try again later.' });
    }
});

// Login route (authenticate user)
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error. Try again later.' });
        }

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            res.json({ success: true, message: 'Login successful!', redirect: '/resume/details' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }
    });
});

// Fetch all users (for details page)
app.get('/getUsers', (req, res) => {
    const query = 'SELECT id, name, email FROM users';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ success: false, message: 'Database error. Try again later.' });
        }
        res.json(results);
    });
});

// Update user details
app.post('/updateUser', (req, res) => {
    const { id, name } = req.body;

    if (!id || !name) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const query = 'UPDATE users SET name = ? WHERE id = ?';
    db.query(query, [name, id], (err) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ success: false, message: 'Database error. Try again later.' });
        }
        res.json({ success: true, message: 'User updated successfully!' });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

