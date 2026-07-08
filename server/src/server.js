// server/src/server.js
const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')

// Load Environment Variables
dotenv.config();

//Connect to Database
const connectDB = require('./config/db');

const app = express();

// Execute the function
connectDB();

// Security & Parsing Middleware
app.use(helmet());
app.use(cors({
    origin: 'https://localhost:3000', // We will lock this down to our Next.js frontend
    credentials: true // Crucial for accepting HttpOnly cookies later
}));
app.use(express.json()); // Parses incoming JSON payloads
app.use(cookieParser());

// Base Health Route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Tesserio API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});