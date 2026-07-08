// server/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = async (req, res, next) => {
    try {
        // Grab the token from our secure HttpOnly cookie parser capsule
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ status: 'fail', message: 'Authentication required. Access denied.' });
        }

        // Decrypt the token signature using our secret matrix
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Track down the user in MongoDB from the token payload identifier
        const user = await User.findById(decoded.id).select('-googleId'); // Exclude provider metadata for safety

        if (!user) {
            return res.status(401).json({ status: 'fail', message: 'User session no longer valid.' });
        }

        // Attach the fully populated mongoose record object right into the current lifecycle request context
        req.user = user;

        // Pass control to the next execution block in the pipeline loop
        next();
    } catch (error) {
        return res.status(401).json({ status: 'fail', message: 'Token signature invalid or expired.' });
    }
};

module.exports = { requireAuth };