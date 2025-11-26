//postController.js
import Post from "../models/post.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import mongoose from "mongoose";

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
            userId: req.user.id,
            title: req.body.title,
            body: req.body.body,
            imageUrl: uploaded.secure_url,
            cloudinaryId: uploaded.public_id,
        });

        // Delete local temp file safely (async)
        fs.promises.unlink(req.file.path).catch(err => {
            console.error("Failed to delete local temp file:", err.message);
            // no need to stop execution; continue
        });

        res.status(201).json({ message: "Post created", post });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Server error\n${err.message}` });
    }
};

export const getAllPosts = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = 10;
        const skip = (page - 1) * limit;

        // aggregate posts with counts using $lookup + $group
        const pipeline = [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            // lookup comment counts
            {
                $lookup: {
                    from: "comments",
                    let: { postId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$postId", "$$postId"] } } },
                        { $count: "count" }
                    ],
                    as: "commentCount"
                }
            },
            // lookup reaction counts grouped by reaction
            {
                $lookup: {
                    from: "reactions",
                    let: { postId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$postId", "$$postId"] } } },
                        { $group: { _id: "$reaction", count: { $sum: 1 } } }
                    ],
                    as: "reactionCounts"
                }
            },
            // reshape counts
            {
                $addFields: {
                    commentCount: { $arrayElemAt: ["$commentCount.count", 0] },
                    likes: {
                        $reduce: {
                            input: "$reactionCounts",
                            initialValue: 0,
                            in: {
                                $cond: [
                                    { $eq: ["$$this._id", "like"] },
                                    { $add: ["$$value", "$$this.count"] },
                                    "$$value"
                                ]
                            }
                        }
                    },
                    dislikes: {
                        $reduce: {
                            input: "$reactionCounts",
                            initialValue: 0,
                            in: {
                                $cond: [
                                    { $eq: ["$$this._id", "dislike"] },
                                    { $add: ["$$value", "$$this.count"] },
                                    "$$value"
                                ]
                            }
                        }
                    }
                }
            },
            // ensure numbers are present
            {
                $addFields: {
                    commentCount: { $ifNull: ["$commentCount", 0] },
                    likes: { $ifNull: ["$likes", 0] },
                    dislikes: { $ifNull: ["$dislikes", 0] }
                }
            }
        ];

        const posts = await Post.aggregate(pipeline);

        // total posts count for pagination meta
        const total = await Post.countDocuments();

        res.json({
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            posts
        });
    } catch (err) {
        console.error("getAllPosts:", err);
        res.status(500).json({ error: err.message });
    }
};

export const getPost = async (req, res) => {
    try {
        const postId = req.params.id;

        const pipeline = [
            { $match: { _id: mongoose.Types.ObjectId(postId) } },
            // lookup comment count
            {
                $lookup: {
                    from: "comments",
                    let: { postId: "$_id" },
                    pipeline: [{ $match: { $expr: { $eq: ["$postId", "$$postId"] } } }, { $count: "count" }],
                    as: "commentCount"
                }
            },
            // lookup reaction counts grouped
            {
                $lookup: {
                    from: "reactions",
                    let: { postId: "$_id" },
                    pipeline: [{ $match: { $expr: { $eq: ["$postId", "$$postId"] } } }, { $group: { _id: "$reaction", count: { $sum: 1 } } }],
                    as: "reactionCounts"
                }
            },
            {
                $addFields: {
                    commentCount: { $arrayElemAt: ["$commentCount.count", 0] },
                    likes: {
                        $reduce: {
                            input: "$reactionCounts",
                            initialValue: 0,
                            in: { $cond: [{ $eq: ["$$this._id", "like"] }, { $add: ["$$value", "$$this.count"] }, "$$value"] }
                        }
                    },
                    dislikes: {
                        $reduce: {
                            input: "$reactionCounts",
                            initialValue: 0,
                            in: { $cond: [{ $eq: ["$$this._id", "dislike"] }, { $add: ["$$value", "$$this.count"] }, "$$value"] }
                        }
                    }
                }
            },
            {
                $addFields: {
                    commentCount: { $ifNull: ["$commentCount", 0] },
                    likes: { $ifNull: ["$likes", 0] },
                    dislikes: { $ifNull: ["$dislikes", 0] }
                }
            }
        ];

        const results = await Post.aggregate(pipeline);
        if (!results.length) return res.status(404).json({ error: "Post not found" });

        res.json(results[0]);
    } catch (err) {
        console.error("getPost:", err);
        res.status(500).json({ error: err.message });
    }
};

export const keepAwake = async (req, res) => {
    try {
        res.json({ "message": "Server is awake." });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: `Server error\n${err.message}` });
    }
};

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        // Only the owner can delete
        if (post.userId.toString() !== req.user.id) {
            return res.status(403).json({ error: "Not authorized to delete this post" });
        }

        // Delete image from Cloudinary
        try {
            if (post.cloudinaryId) {
                await cloudinary.uploader.destroy(post.cloudinaryId);
            }
        } catch (cloudErr) {
            console.error("Cloudinary deletion error:", cloudErr.message);
            // continue to delete post in DB even if Cloudinary fails
        }

        await post.deleteOne();
        res.json({ message: "Post deleted" });

    } catch (err) {
        console.error("deletePost:", err.message);
        res.status(500).json({ error: `Server error\n${err.message}` });
    }
};
