// server/src/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const passport = require('passport'); // 1. Pull in passport core
const pinRoutes = require('./routes/pins');

// Load Environment Variables First
dotenv.config();

// Connect to Database
const connectDB = require('./config/db');
connectDB();

// Initialize Passport Strategies
require('./config/passport'); // 2. Load your passport strategy blueprint config

const app = express();

// Security & Parsing Middleware
app.use(helmet());
app.use(cors({
    origin: 'http://localhost:3000', // Ensure this is http (not https) for local development matching Next.js
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize()); // 3. Mount Passport runtime stream

// Mount Auth Handshake Routers
const authRoutes = require('./routes/auth'); // 4. Pull in your routes module
app.use('/api/auth', authRoutes); // 5. Bind routing paths
app.use('/api/pins', pinRoutes);

// Base Health Route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Tesserio API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});