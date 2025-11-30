// src/models/Vote.js
import mongoose from 'mongoose';

const VoteSchema = new mongoose.Schema({
    target_type: { type: String, required: true, enum: ['idea', 'comment'] },
    target_id: { type: String, required: true },
    user_id: { type: String, required: true },
    value: { type: Number, required: true, enum: [1, -1] },
    jti: { type: String, required: true, unique: true },
    created_at: { type: Date, default: Date.now }
});

VoteSchema.index({ target_type: 1, target_id: 1, user_id: 1 }, { unique: true });

export default mongoose.model('Vote', VoteSchema);