// src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import config from '../../config/index.js';

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, config.JWT_SECRET);

            req.user = {
                id: decoded.sub,
                role: decoded.role || 'user',
                jti: decoded.jti
            };

            next();
        } catch (error) {
            console.error('JWT validation failed:', error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
});

const requireModerator = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'moderator')) {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Requires moderator role.' });
    }
};

export { protect, requireModerator };