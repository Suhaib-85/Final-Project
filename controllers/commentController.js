// commentController.js
import Comment from "../models/comment.js";
import Post from "../models/post.js";

// Create a new comment
export const createComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { text } = req.body;
        const userId = req.user.id;

        if (!text) return res.status(400).json({ error: "Text is required" });

        const postExists = await Post.exists({ _id: postId });
        if (!postExists) return res.status(404).json({ error: "Post not found" });

        const comment = await Comment.create({ postId, userId, text });

        res.status(201).json({ message: "Comment created", comment });
    } catch (err) {
        console.error("createComment:", err);
        res.status(500).json({ error: err.message });
    }
};

// Get all comments for a post
export const getCommentsForPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const skip = (page - 1) * limit;

        const [comments, total] = await Promise.all([
            Comment.find({ postId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Comment.countDocuments({ postId }),
        ]);

        res.json({
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            comments,
        });
    } catch (err) {
        console.error("getCommentsForPost:", err);
        res.status(500).json({ error: err.message });
    }
};

// Delete comment
export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        // Fetch comment
        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        // Fetch parent post
        const post = await Post.findById(comment.postId);
        if (!post) return res.status(404).json({ error: "Parent post not found" });

        // Only comment owner or post owner can delete
        if (comment.userId !== req.user.id && post.userId !== req.user.id) {
            return res.status(403).json({ error: "Not authorized to delete this comment" });
        }

        await comment.deleteOne();
        res.json({ message: "Comment deleted successfully" });

    } catch (err) {
        console.error("deleteComment:", err);
        res.status(500).json({ error: err.message });
    }
};