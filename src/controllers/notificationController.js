// src/controllers/notificationController.js
import Notification from '../models/Notification.js';
import asyncHandler from 'express-async-handler';

const getNotifications = asyncHandler(async (req, res) => {
    const recipient_id = req.user.id;
    const { page = 1, limit = 20, unreadOnly = 'false' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { recipient_id };
    if (unreadOnly === 'true') {
        query.read = false;
    }

    const notifications = await Notification.find(query)
        .sort({ created_at: -1 })
        .limit(parseInt(limit))
        .skip(skip);

    const total = await Notification.countDocuments(query);

    res.json({
        notifications,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        unread_count: await Notification.countDocuments({ recipient_id, read: false })
    });
});

const markAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const recipient_id = req.user.id;

    const notification = await Notification.findOneAndUpdate(
        { _id: id, recipient_id },
        { read: true },
        { new: true }
    );

    if (!notification) {
        return res.status(404).json({ message: 'Notification not found or access denied.' });
    }

    res.json(notification);
});

export { getNotifications, markAsRead };