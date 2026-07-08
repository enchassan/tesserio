// server/src/models/Board.js
const mongoose = require('mongoose');

const BoardSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    description: {
        type: String,
        trim: true,
        maxlength: 280,
        default: ''
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // The owner of this collection board
        required: true
    },
    pins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pin' // Relational graph mapping an array of Pin references belonging to this board
    }],
    isPrivate: {
        type: Boolean,
        default: false // Allows users to create secret mood boards for production or cinematography drafts
    }
}, {
    timestamps: true
});

// Compound index to ensure a single user cannot have two boards with the exact same name
BoardSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Board', BoardSchema);