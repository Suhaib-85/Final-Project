// Rate limiting
import rateLimit from "express-rate-limit";

export const readLimit = rateLimit({
    windowMs: 8 * 60 * 1000,
    max: 500,
    message: "Too many requests, try again later.",
    standardHeaders: true,
    legacyHeaders: true
});

export const writeLimit = rateLimit({
    windowMs: 8 * 60 * 1000,
    max: 200,
    message: "Too many requests, try again later.",
    standardHeaders: true,
    legacyHeaders: true
});
