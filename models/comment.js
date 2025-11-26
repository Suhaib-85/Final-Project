// comment.js
import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
    {
        postId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Post", index: true },
        userId: { type: String, required: true },
        text: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.model("Comment", CommentSchema);
