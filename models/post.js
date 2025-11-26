//post.js
import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        title: { type: String, required: true },
        body: { type: String, required: true },
        imageUrl: { type: String, required: true },
        cloudinaryId: { type: String, required: true }
    },
    { timestamps: true }
);

export default mongoose.model("Post", PostSchema);
