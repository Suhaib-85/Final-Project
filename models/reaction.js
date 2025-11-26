// reaction.js
import mongoose from "mongoose";

const ReactionSchema = new mongoose.Schema(
    {
        postId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Post", index: true },
        userId: { type: String, required: true, index: true },
        reaction: { type: String, enum: ["like", "dislike"], required: true },
    },
    { timestamps: true }
);

// one reaction per user per post
ReactionSchema.index({ postId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Reaction", ReactionSchema);
