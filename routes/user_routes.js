const express = require('express'); // Importing the express module
const router = express.Router(); // Creating an instance of the Express router
const bcryptjs = require('bcryptjs'); // Importing the bcryptjs module for password hashing
const jwt = require("jsonwebtoken"); // Importing the jsonwebtoken module for generating JWT tokens
const { JWT_SECRET } = require('../config'); // Importing the JWT_SECRET from the config file

const mongoose = require("mongoose"); // Importing the mongoose module for working with MongoDB
const UserModel = mongoose.model("UserModel"); // Creating a model for the User collection in MongoDB

router.post("/signup", (req, res) => { // Creating a POST route for user signup
    const { fullName, email, password, profileImg } = req.body; // Extracting data from the request body
    if (!fullName || !password || !email) { // Checking if required fields are empty
        return res.status(400).json({ error: "One or more mandatory fields are empty" });
    }
    UserModel.findOne({ email: email }) // Checking if user with the same email already exists
        .then((userInDB) => {
            if (userInDB) { // If user already exists, return an error
                return res.status(500).json({ error: "User with this email already registered" });
            }
            bcryptjs.hash(password, 16) // Hashing the password
                .then((hashedPassword) => {
                    const user = new UserModel({ fullName, email, password: hashedPassword, profileImg }); // Creating a new user with hashed password
                    user.save() // Saving the user to the database
                        .then((newUser) => {
                            return res.status(201).json({ result: "User signed up successfully" });
                        })
                        .catch((err) => {
                            console.log(err);
                        })
                })
                .catch((err) => {
                    console.log(err);
                })
        })
        .catch((err) => {
            console.log(err);
        })
});

module.exports = router; // Exporting the router for use in other files

router.post("/login", (req, res) => { // Creating a POST route for user login
    const { email, password } = req.body; // Extracting data from the request body
    if (!password || !email) { // Checking if required fields are empty
        return res.status(400).json({ error: "One or more mandatory fields are empty" });
    }
    UserModel.findOne({ email: email }) // Finding the user with the provided email
        .then((userInDB) => {
            if (!userInDB) { // If user doesn't exist, return an error
                return res.status(401).json({ error: "User with this email already registered" });
            }
            bcryptjs.compare(password, userInDB.password) // Comparing the provided password with the hashed password in the database
                .then((didMatch) => {
                    if (didMatch) { // If passwords match, generate JWT token
                        const jwtToken = jwt.sign({ _id: userInDB._id }, JWT_SECRET); // Generating JWT token with user's ID
                        const userInfo = { "email": userInDB.email, "fullName": userInDB.fullName };
                        res.status(200).json({ result: { token: jwtToken, user: userInfo } });
                    } else { // If passwords don't match, return an error
                        res.status(401).json({ error: "Incorrect Password" });
                    }
                })
                .catch((err) => {
                    console.log(err);
                })
        })
        .catch((err) => {
            console.log(err);
        })
});

module.exports = router; // Exporting the router for use in other files
