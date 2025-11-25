// controllers/reactionController.js
import Reaction from "../models/reaction.js";
import Post from "../models/post.js";

export const toggleReaction = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId, reaction } = req.body;

        if (!userId || !reaction) return res.status(400).json({ error: "userId and reaction are required" });
        if (!["like", "dislike"].includes(reaction)) return res.status(400).json({ error: "Invalid reaction" });

        const postExists = await Post.exists({ _id: postId });
        if (!postExists) return res.status(404).json({ error: "Post not found" });

        // find existing reaction
        const existing = await Reaction.findOne({ postId, userId });

        if (!existing) {
            // create new reaction
            const created = await Reaction.create({ postId, userId, reaction });
            return res.status(201).json({ message: "Reaction added", reaction: created });
        }

        if (existing.reaction === reaction) {
            // same reaction -> remove (toggle)
            await existing.deleteOne();
            return res.json({ message: "Reaction removed" });
        }

        // different reaction -> update
        existing.reaction = reaction;
        await existing.save();
        return res.json({ message: "Reaction updated", reaction: existing });
    } catch (err) {
        console.error("toggleReaction:", err);
        res.status(500).json({ error: err.message });
    }
};

export const getReactionCounts = async (req, res) => {
    try {
        const { postId } = req.params;
        const [likes, dislikes] = await Promise.all([
            Reaction.countDocuments({ postId, reaction: "like" }),
            Reaction.countDocuments({ postId, reaction: "dislike" }),
        ]);

        res.json({
            likes,
            dislikes,
            total: likes + dislikes,
        });
    } catch (err) {
        console.error("getReactionCounts:", err);
        res.status(500).json({ error: err.message });
    }
};
