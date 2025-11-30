// src/routes/notificationRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getNotifications, markAsRead } from '../controllers/notificationController.js';

const router = express.Router();

/**
 * @openapi
 * /notifications:
 *   get:
 *     summary: Get the current user's notifications.
 *     security:
 *       - bearerAuth: []
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Only return unread notifications.
 *     responses:
 *       200:
 *         description: Notifications returned.
 */

router.get('/', protect, getNotifications);

/**
 * @openapi
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read.
 *     security:
 *       - bearerAuth: []
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ObjectId.
 *     responses:
 *       200:
 *         description: Notification marked as read.
 */

router.patch('/:id/read', protect, markAsRead);

export default router;