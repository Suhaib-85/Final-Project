// src/controllers/adminController.js
import Comment from '../models/Comment.js';
import asyncHandler from 'express-async-handler';
import { invalidateIdeaCache } from '../services/notificationService.js';

const deleteCommentByModerator = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });

    comment.is_deleted = true;
    await comment.save();

    await invalidateIdeaCache(comment.idea_id);

    res.status(200).json({ message: `Comment ${id} soft-deleted by moderator.` });
});

export { deleteCommentByModerator };