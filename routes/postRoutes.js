import express from "express";
import upload from "../middleware/upload.js";
import {
    createPost,
    getAllPosts,
    getPost,
    deletePost
} from "../controllers/postController.js";

const router = express.Router();
router.post("/", upload.single("image"), createPost);
router.get("/", getAllPosts);
router.get("/:id", getPost);
router.delete("/:id", deletePost);

export default router;