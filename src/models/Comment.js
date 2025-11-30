// src/models/Comment.js
import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
    idea_id: { type: String, required: true },
    author_id: { type: String, required: true },
    parent_id: { type: mongoose.Schema.Types.ObjectId, default: null },
    body: { type: String, required: true, trim: true },
    created_at: { type: Date, default: Date.now },
    edited_at: { type: Date, default: null },
    is_deleted: { type: Boolean, default: false },
});

CommentSchema.index({ idea_id: 1, parent_id: 1, created_at: -1 });

export default mongoose.model('Comment', CommentSchema);