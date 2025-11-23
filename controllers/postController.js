import Post from "../models/post.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export const createPost = async (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ error: "Image file is required" });

        // Upload to Cloudinary
        const uploaded = await cloudinary.uploader.upload(req.file.path, {
            folder: "social_posts",
        });

        // Create post in MongoDB
        const post = await Post.create({
            userId: req.body.userId,
            title: req.body.title,
            body: req.body.body,
            imageUrl: uploaded.secure_url,
            cloudinaryId: uploaded.public_id,
        });

        // Delete local temp file
        fs.unlinkSync(req.file.path);

        res.status(201).json({ message: "Post created", post });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Server error\n${err.message}` });
    }
};

export const getAllPosts = async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = 10;
        let skip = (page - 1) * limit;

        const posts = await Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

        res.json({
            page,
            count: posts.length,
            posts
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: `Server error\n${err.message}` });
    }
};

export const getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });
        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: `Server error\n${err.message}` });
    }
};

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Not found" });
        await cloudinary.uploader.destroy(post.cloudinaryId);
        await post.deleteOne();
        res.json({ message: "Post deleted" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: `Server error\n${err.message}` });
    }
}
