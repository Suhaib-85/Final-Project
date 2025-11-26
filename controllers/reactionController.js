// reactionController.js
import Reaction from "../models/reaction.js";
import Post from "../models/post.js";

// Toggle or add reaction
export const toggleReaction = async (req, res) => {
    try {
        const { postId } = req.params;
        const { reaction } = req.body;
        const userId = req.user.id;

        // Validate reaction
        if (!reaction) {
            return res.status(400).json({ error: "Reaction is required" });
        }
        if (!["like", "dislike"].includes(reaction)) {
            return res.status(400).json({ error: "Invalid reaction" });
        }

        // Ensure post exists
        const postExists = await Post.exists({ _id: postId });
        if (!postExists) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Find existing reaction by this user
        const existing = await Reaction.findOne({ postId, userId });

        // CASE 1 — No previous reaction → create one
        if (!existing) {
            const created = await Reaction.create({ postId, userId, reaction });
            return res.status(200).json({
                message: "Reaction added",
                action: "added",
                reaction: created
            });
        }

        // CASE 2 — Same reaction clicked again → remove
        if (existing.reaction === reaction) {
            await existing.deleteOne();
            return res.status(200).json({
                message: "Reaction removed",
                action: "removed"
            });
        }

        // CASE 3 — Switch reaction
        existing.reaction = reaction;
        await existing.save();

        return res.status(200).json({
            message: "Reaction updated",
            action: "updated",
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
