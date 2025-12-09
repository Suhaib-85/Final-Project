// src/controllers/commentController.js
import Comment from '../models/Comment.js';
import asyncHandler from 'express-async-handler';
import { notifyUser, invalidateIdeaCache } from '../services/notificationService.js';
import { getIo } from '../services/socketio.js';

const fetchAuthorDetails = async (authorId) => ({
    name: 'User ' + authorId.substring(0, 4),
    avatar: 'url'
});

// Helper to simulate fetching idea owner (since FastAPI/MySQL might be empty)
const fetchIdeaOwnerId = async (ideaId) => {
    // In production, this would be an axios call to FastAPI.
    // For now, we return a fallback ID to ensure the notification service runs.
    return "fa53b41a-e47a-4785-ba44-53be3c4cc90e"; // Fallback/Mock ID
};

const createComment = asyncHandler(async (req, res) => {
    const { idea_id, parent_id, body } = req.body;
    const author_id = req.user.id;

    // 1. Create Comment
    const newComment = await Comment.create({
        idea_id,
        author_id,
        parent_id: parent_id || null,
        body,
    });

    // 2. Cache Invalidation
    await invalidateIdeaCache(idea_id);

    // 3. Real-Time Broadcast
    const author = await fetchAuthorDetails(author_id);
    const commentWithAuthor = {
        ...newComment.toObject(),
        author: author
    };

    const io = getIo();
    const roomName = `idea:${idea_id}`;
    io.to(roomName).emit('comment_created', commentWithAuthor);

    // 4. Notification Logic (Robust)
    let recipientId = null;

    if (!parent_id) {
        // Top-level comment: Notify Idea Owner
        recipientId = await fetchIdeaOwnerId(idea_id);
    } else {
        // Reply: Notify Parent Comment Author
        const parentComment = await Comment.findById(parent_id);
        if (parentComment) {
            recipientId = parentComment.author_id;
        }
    }

    // Only notify if recipient exists and is not the person who commented
    if (recipientId && recipientId !== author_id) {
        try {
            await notifyUser(
                recipientId,
                author_id,
                parent_id ? 'REPLY_TO_COMMENT' : 'COMMENT_ON_IDEA',
                `${author.name} commented on your post.`,
                `/ideas/${idea_id}`
            );
        } catch (error) {
            console.error("Notification failed:", error.message);
        }
    }

    res.status(201).json(commentWithAuthor);
});

const getComments = asyncHandler(async (req, res) => {
    const { idea_id, parent_id, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (!idea_id && !parent_id) {
        return res.status(400).json({ message: 'Must provide either idea_id or parent_id.' });
    }

    const query = { is_deleted: false };

    if (parent_id) {
        query.parent_id = parent_id;
    } else {
        query.idea_id = idea_id;
        query.parent_id = null;
    }

    // --- FIX 1: Pass 'query' directly, do not wrap in object ---
    const comments = await Comment.find(query) 
        .sort({ created_at: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .lean();

    // --- FIX 2: Use the dynamic 'query' here too ---
    const total = await Comment.countDocuments(query);

    const commentIds = comments.map(c => c._id);
    const childCounts = await Comment.aggregate([
        { $match: { parent_id: { $in: commentIds }, is_deleted: false } },
        { $group: { _id: '$parent_id', count: { $sum: 1 } } }
    ]);

    const countMap = childCounts.reduce((acc, curr) => {
        acc[curr._id.toString()] = curr.count;
        return acc;
    }, {});

    const finalComments = comments.map(c => ({
        ...c,
        children_count: countMap[c._id.toString()] || 0
    }));

    res.json({
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        comments: finalComments,
        next_page: (skip + comments.length) < total ? parseInt(page) + 1 : null
    });
});

const updateComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { body } = req.body;
    const user_id = req.user.id;

    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });

    if (comment.author_id !== user_id) {
        return res.status(403).json({ message: 'Not authorized to edit this comment.' });
    }

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    if (comment.created_at < tenMinutesAgo) {
        return res.status(403).json({ message: 'Edit timeframe exceeded (10 minutes).' });
    }

    comment.body = body;
    comment.edited_at = Date.now();
    await comment.save();

    await invalidateIdeaCache(comment.idea_id);

    res.json(comment);
});

export { createComment, getComments, updateComment };
