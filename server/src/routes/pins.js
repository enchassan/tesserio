// server/src/routes/pins.js
const express = require('express');
const router = express.Router();
const Pin = require('../models/Pin');
const User = require('../models/User');
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
            .populate('comments.user', 'name avatar')
            .sort({ createdAt: -1 });

        res.status(200).json({
            status: 'success',
            results: pins.length,
            pins
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// @desc    Add a comment to a pin node asset
// @route   POST /api/pins/:id/comments
// @access  Private
router.post('/:id/comments', requireAuth, async (req, res) => {
    try {
        const pinId = req.params.id;
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ status: 'fail', message: 'Comment text cannot be empty node frames.' });
        }

        // 1. Find the target pin asset document
        const pin = await Pin.findById(pinId);
        if (!pin) {
            return res.status(404).json({ status: 'fail', message: 'Target pin node asset not found.' });
        }

        // 2. Construct the single comment structural model object
        const newComment = {
            user: req.user._id, // User bound from requireAuth session
            text: text.trim()
        };

        // 3. Push to array and persist to Atlas cluster
        pin.comments.push(newComment);
        await pin.save();

        // 4. Fetch the full fresh comment tree and populate user fields for instantaneous frontend update
        const updatedPin = await Pin.findById(pinId)
            .populate('comments.user', 'name avatar');

        res.status(201).json({
            status: 'success',
            message: 'Comment node safely committed to media graph.',
            comments: updatedPin.comments
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// @desc    Toggle Saving/Bookmarking a Pin Asset Node
// @route   POST /api/pins/:id/save
// @access  Private
router.post('/:id/save', requireAuth, async (req, res) => {
    try {
        const pinId = req.params.id;
        const userId = req.user._id; // requireAuth middleware binds verified session data to req.user

        // 1. Verify the target pin exists in the database cluster
        const pin = await Pin.findById(pinId);
        if (!pin) {
            return res.status(404).json({
                status: 'fail',
                message: 'No pin discovery path resolved matching this ID metadata.'
            });
        }

        // 2. Fetch the active session user profile record node
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'Active session user profile node not discovered.'
            });
        }

        // 3. Determine if the pin ID is already nested in the savedPins array
        const isAlreadySaved = user.savedPins.includes(pinId);

        if (isAlreadySaved) {
            // Pin is already saved -> Pull/Remove it out of the relational array
            user.savedPins = user.savedPins.filter(id => id.toString() !== pinId);
            await user.save();

            return res.status(200).json({
                status: 'success',
                message: 'Asset successfully unlinked from saved collections stream.',
                isSaved: false
            });
        } else {
            // Pin is not saved yet -> Push it straight into the relational array node
            user.savedPins.push(pinId);
            await user.save();

            return res.status(200).json({
                status: 'success',
                message: 'Asset successfully written to saved collections cluster stream.',
                isSaved: true
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router;