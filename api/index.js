const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bodyParser = require('body-parser');
const User = require('./models/User');

const app = express();

// Load environment variables from .env file
dotenv.config();

// Set up CORS middleware to allow requests from the frontend
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL // Replace this with your frontend URL
}));

// Parse incoming request bodies
app.use(bodyParser.json());

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Successfully connected to MongoDB");
        app.listen(4000, () => {
            console.log("Server is listening on port 4000");
        });
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
    }
}

startServer();

app.get('/test', (req, res) => {
    res.json("test ok");
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        const createdUser = await User.create({ username, password });
        const token = jwt.sign({ userId: createdUser._id }, process.env.JWT_SECRET);
        res.cookie('token', token).status(201).json('User created successfully');
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
