const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON and URL-encoded data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files (for frontend)
app.use(express.static(path.join(__dirname, "public")));

// Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "sridhar",  // Replace with your MySQL password
    database: "sridhar"   // Ensure the database exists
});

// Handle database connection errors properly
db.connect(err => {
    if (err) {
        console.error("❌ Database Connection Failed:", err.message);
        process.exit(1); // Exit to prevent further issues
    }
    console.log("✅ Connected to MySQL Database");
});

// Global error handler to prevent crashes
process.on("uncaughtException", (err) => {
    console.error("🚨 Uncaught Exception:", err.message);
});

// Serve the signup page (HTML)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "login1.html"), (err) => {
        if (err) {
            console.error("❌ Error serving login page:", err.message);
            res.status(500).send("❌ Internal Server Error: Unable to load login page.");
        }
    });
});

// Signup Route
app.post("/signup", async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    // Validate input
    if (!name || !email || !password || !confirmPassword) {
        return res.status(400).send("❌ All fields are required!");
    }
    if (password !== confirmPassword) {
        return res.status(400).send("❌ Passwords do not match!");
    }

    try {
        // Check if user already exists
        const checkUserQuery = "SELECT * FROM userdetail WHERE email = ?";
        db.query(checkUserQuery, [email], async (err, results) => {
            if (err) {
                console.error("❌ Database Error:", err.message);
                return res.status(500).send("❌ Database Error: " + err.message);
            }
            if (results.length > 0) {
                return res.status(400).send("❌ User already exists!");
            }

            try {
                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Insert new user
                const insertUserQuery = "INSERT INTO userdetail (name, email, password) VALUES (?, ?, ?)";
                db.query(insertUserQuery, [name, email, hashedPassword], (err, result) => {
                    if (err) {
                        console.error("❌ Database Insert Error:", err.message);
                        return res.status(500).send("❌ Database Error: " + err.message);
                    }
                    res.status(200).send("✅ Signup Successful!");
                });
            } catch (hashError) {
                console.error("❌ Password Hashing Error:", hashError.message);
                res.status(500).send("❌ Server Error: Failed to hash password.");
            }
        });
    } catch (error) {
        console.error("❌ Server Error:", error.message);
        res.status(500).send("❌ Server Error: " + error.message);
    }
});

// Start Server with error handling
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
}).on("error", (err) => {
    console.error("❌ Server Error:", err.message);
    process.exit(1);
});
