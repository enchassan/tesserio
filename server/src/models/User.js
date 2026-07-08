// server/src/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique : true, // Prevents duplicate profiles from a single google account
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique : true,
        lowercase: true,
    },
    avatar: {
        type: String, // Google profile picture URL
        default: ''
    },
    bio: {
        type: String,
        maxlength: 160,
        default: '',
    },
    // Relational Arrays (Self-referencing the User Model for social features)
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true // Automatically generates createdAt and updatedAt fields
});

module.exports = mongoose.model('User', UserSchema);