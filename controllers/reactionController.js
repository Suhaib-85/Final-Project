// controllers/reactionController.js
import Reaction from "../models/reaction.js";
import Post from "../models/post.js";

export const toggleReaction = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId, reaction } = req.body;

        // Validate inputs
        if (!userId || !reaction) {
            return res.status(400).json({ error: "userId and reaction are required" });
        }
        if (!["like", "dislike"].includes(reaction)) {
            return res.status(400).json({ error: "Invalid reaction" });
        }

        // Ensure post exists
        const postExists = await Post.exists({ _id: postId });
        if (!postExists) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Find existing reaction by this user on this post
        const existing = await Reaction.findOne({ postId, userId });

        // CASE 1 — No previous reaction → create one
        if (!existing) {
            const created = await Reaction.create({ postId, userId, reaction });
            return res.status(201).json({
                message: "Reaction added",
                reaction: created
            });
        }

        // CASE 2 — User clicked the same reaction again → remove (toggle off)
        if (existing.reaction === reaction) {
            await existing.deleteOne();
            return res.json({
                message: "Reaction removed"
            });
        }

        // CASE 3 — User switches reaction (like → dislike, or dislike → like)
        existing.reaction = reaction;
        await existing.save();

        return res.json({
            message: "Reaction updated",
            reaction: existing
        });

    } catch (err) {
        console.error("toggleReaction:", err);
        return res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
};

export const getReactionCounts = async (req, res) => {
    try {
        const { postId } = req.params;

        const [likes, dislikes] = await Promise.all([
            Reaction.countDocuments({ postId, reaction: "like" }),
            Reaction.countDocuments({ postId, reaction: "dislike" })
        ]);

        return res.json({
            likes,
            dislikes,
            total: likes + dislikes
        });

    } catch (err) {
        console.error("getReactionCounts:", err);
        return res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
};
