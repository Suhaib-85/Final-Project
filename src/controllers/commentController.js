// src/controllers/commentController.js
import Comment from '../models/Comment.js';
import asyncHandler from 'express-async-handler';
import { notifyUser, invalidateIdeaCache } from '../services/notificationService.js';
import { getIo } from '../services/socketio.js';

const fetchAuthorDetails = async (authorId) => ({
    name: 'User ' + authorId.substring(0, 4),
    avatar: 'url'
});

const createComment = asyncHandler(async (req, res) => {
    const { idea_id, parent_id, body } = req.body;
    const author_id = req.user.id;

    const newComment = await Comment.create({
        idea_id,
        author_id,
        parent_id: parent_id || null,
        body,
    });

    await invalidateIdeaCache(idea_id);

    const author = await fetchAuthorDetails(author_id);
    const commentWithAuthor = {
        ...newComment.toObject(),
        author: author
    };

    const io = getIo();
    const roomName = `idea:${idea_id}`;
    io.to(roomName).emit('comment_created', commentWithAuthor);

    // Notification stub for the idea owner (requires fetching owner ID from FastAPI/MySQL)
    // await notifyUser(ideaOwnerId, author_id, 'COMMENT_ON_IDEA', 
    //     `${author.name} commented on your idea.`, `/ideas/${idea_id}`);

    res.status(201).json(commentWithAuthor);
});

const getComments = asyncHandler(async (req, res) => {
    const { idea_id, parent_id, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (!idea_id && !parent_id) {
        return res.status(400).json({ message: 'either pass "idea_id" for top level comments or "parent_id" for children comments (also called comment replies).' });
    }

    const query = { is_deleted: false };

    if (parent_id) {
        query.parent_id = parent_id;
    } else {
        query.idea_id = idea_id;
        query.parent_id = null;
    }

    const comments = await Comment.find({ query })
        .sort({ created_at: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .lean();

    const total = await Comment.countDocuments({ idea_id, parent_id: null, is_deleted: false });

    const commentIds = comments.map(c => c._id);
    const childCounts = await Comment.aggregate([
        { $match: { parent_id: { $in: commentIds } } },
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
