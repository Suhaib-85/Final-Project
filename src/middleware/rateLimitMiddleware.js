// src/middleware/rateLimitMiddleware.js
import redisClient from '../../config/redis.js';
import asyncHandler from 'express-async-handler';

const LIMITS = {
    'post': { limit: 30, window: 3600 },
    'comment': { limit: 60, window: 3600 },
    'vote': { limit: 120, window: 3600 }
};

const rateLimiter = (prefix) => asyncHandler(async (req, res, next) => {
    const { limit, window } = LIMITS[prefix];
    const key = req.user ? req.user.id : req.ip;
    const redisKey = `RL:${prefix}:${key}`;

    const [count, ttl] = await redisClient.multi()
        .incr(redisKey)
        .ttl(redisKey)
        .exec();

    if (ttl < 0) {
        await redisClient.expire(redisKey, window);
    }

    const remaining = limit - count;

    if (count > limit) {
        const resetTime = (ttl > 0 ? ttl : window);
        res.set('Retry-After', resetTime);
        res.set('X-RateLimit-Limit', limit);
        res.set('X-RateLimit-Remaining', 0);
        return res.status(429).json({
            message: `Too many requests. Limit: ${limit} per hour.`,
            retry_after: resetTime
        });
    }

    res.set('X-RateLimit-Limit', limit);
    res.set('X-RateLimit-Remaining', remaining > 0 ? remaining : 0);
    next();
});

const rateLimitComments = rateLimiter('comment');
const rateLimitVotes = rateLimiter('vote');

export { rateLimitComments, rateLimitVotes };