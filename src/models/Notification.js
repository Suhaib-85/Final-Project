// src/models/Notification.js
import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    recipient_id: { type: String, required: true },
    actor_id: String,
    type: {
        type: String,
        required: true,
        enum: ['COMMENT_ON_IDEA', 'VOTE_ON_IDEA', 'REPLY_TO_COMMENT', 'TEAM_INVITE']
    },
    message: { type: String, required: true },
    target_url: { type: String },
    read: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
});

NotificationSchema.index({ recipient_id: 1, read: 1, created_at: -1 });

export default mongoose.model('Notification', NotificationSchema);