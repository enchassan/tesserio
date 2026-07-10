// server/src/models/Pin.js
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    }
}, { timestamps: true });

const PinSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500,
        default: ''
    },
    mediaUrl: {
        type: String,
        required: true // The cloud URL (S3/Cloudinary) where the high-res image or video is stored
    },
    mediaType: {
        type: String,
        enum: ['image', 'video'],
        default: 'image'
    },
    aspectRatio: {
        type: Number, // Storing the aspect ratio (e.g., 0.75 for 3:4) is crucial for rendering smooth masonry layout skeletons on the frontend
        default: 1
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Links the Pin back to its original creator
        required: true
    },
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Pin', PinSchema);