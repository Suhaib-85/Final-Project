// src/models/Activity.js
import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
    actor_id: String,
    type: {
        type: String,
        required: true,
        enum: ['NEW_IDEA', 'NEW_COMMENT', 'NEW_VOTE', 'TEAM_INVITE']
    },
    target_id: String,
    payload: Object,
    created_at: { type: Date, default: Date.now },
});

ActivitySchema.index({ created_at: -1 });

export default mongoose.model('Activity', ActivitySchema);