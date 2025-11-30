// src/app.js
import express from 'express';
import cors from 'cors';
import config from '../config/index.js';
import setupSwagger from '../config/swagger.js';

// Import Routes
import voteRoutes from './routes/voteRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// Middleware
app.use(cors({ origin: config.FRONTEND_URL }));
app.use(express.json());

// API Documentation Setup
setupSwagger(app);

// Routes
app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
});
app.use('/api/v1/votes', voteRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);

// Simple Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).send({
        message: err.message || 'Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

export default app;