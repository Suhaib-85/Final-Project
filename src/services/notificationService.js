// src/services/notificationService.js
import Notification from '../models/Notification.js';
import Activity from '../models/Activity.js';
import { getIo } from './socketio.js';
import redisClient from '../../config/redis.js';

// Redis Cache Keys
const TRENDING_IDEAS_KEY = 'ideas:trending';
const IDEAS_DETAIL_KEY = (ideaId) => `idea:detail:${ideaId}`;

const invalidateIdeaCache = async (ideaId) => {
    await redisClient.del(TRENDING_IDEAS_KEY);
    await redisClient.del(IDEAS_DETAIL_KEY(ideaId));
    console.log(`Cache invalidated for Idea ID: ${ideaId}`);
};

const notifyUser = async (recipientId, actorId, type, message, targetUrl) => {
    const notification = await Notification.create({
        recipient_id: recipientId,
        actor_id: actorId,
        type,
        message,
        target_url: targetUrl
    });

    await Activity.create({
        actor_id: actorId,
        type,
        target_id: targetUrl.split('/').pop(),
        payload: { recipientId, message }
    });

    const io = getIo();
    const roomName = `user:${recipientId}`;

    io.to(roomName).emit('new_notification', notification);

    return notification;
};

export { notifyUser, invalidateIdeaCache };