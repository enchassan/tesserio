// server/src/routes/pins.js
const express = require('express');
const router = express.Router();
const Pin = require('../models/Pin');
const { requireAuth } = require('../middleware/auth');

// @desc    Create a New Pin
// @route   POST /api/pins
// @access  Private
router.post('/', requireAuth, async (req, res) => {
    try {
        const { title, description, mediaUrl, mediaType, aspectRatio } = req.body;

        if (!title || !mediaUrl) {
            return res.status(400).json({ status: 'fail', message: 'Title and Media URL are required fields.' });
        }

        // Instantiate the document tied to req.user._id attached by our auth guard
        const newPin = await Pin.create({
            title,
            description,
            mediaUrl,
            mediaType: mediaType || 'image',   // Added explicit property key "mediaType:"
            aspectRatio: aspectRatio || 1,     // Added explicit property key "aspectRatio:"
            user: req.user._id
        });

        res.status(201).json({
            status: 'success',
            pin: newPin
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// @desc    Get All Pins (Global Feed Stream)
// @route   GET /api/pins
// @access  Public
router.get('/', async (req, res) => {
    try {
        // Fetch pins and populate user reference fields (excluding sensitive credentials)
        const pins = await Pin.find()
            .populate('user', 'name avatar email')
            .sort({ createdAt: -1 }); // Newest items first

        res.status(200).json({
            status: 'success',
            results: pins.length,
            pins
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

module.exports = router;