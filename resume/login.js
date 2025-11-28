// const mysql = require("mysql");
// const express = require("express");

// const bodyParser = require("body-parser");
// const encoder = bodyParser.urlencoded();


// const app=express();


// const connection =mysql.createConnection({
//     host:"localhost",
//     user:"root",
//     database:"sridhar",
//     password:"sridhar"

// });
// connection.connect(function(error){
//     if(error)
//         throw error
//      else
//         console.log("database connected successfully");
    

// });

// app.get("/",function(req,res){
//     res.sendFile(__dirname + "/sridharlogin.html");

// })

// app.post("/",encoder,function(req,res){
//     var username = req.body.username;
//     var password = req.body.password;
//     connection.query("select * from userdetail where username =? and password=?",[username,password],function(error,results,fields){
//         if(results.length > 0){
//             res.redirect("/welcome");
//          }
//           else{
//             res.redirect("/");

//             }
//             res.end();



//     })

// })

// //when login  is success
// app.get("/welcome",function(req,res){
//     res.sendFile(__dirmname + "/welcome.html");

// })




// //set port number

// app.listen(4500);











const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "sridhar",
    database: "sridhar"
});

connection.connect((error) => {
    if (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1); // Exit if connection fails
    }
    console.log("Database connected successfully");
});

// Serve login page
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/sridharlogin.html");
});

// Login handling
app.post("/", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        console.log("Login failed: Missing username or password");
        return res.redirect("/");
    }

    connection.query(
        "SELECT * FROM userdetail WHERE username = ? AND password = ?",
        [username, password],
        (error, results) => {
            if (error) {
                console.error("Database query error:", error.message);
                return res.status(500).send("Internal Server Error");
            }

            if (results.length > 0) {
                console.log(`User logged in: ${username}`);
                res.redirect("/welcome");
            } else {
                console.log("Login failed: Invalid credentials");
                res.redirect("/");
            }
        }
    );
});

// Serve welcome page after successful login
app.get("/welcome", (req, res) => {
    res.sendFile(__dirname + "/welcome.html");
});

// Start server
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
