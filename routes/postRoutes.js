import express from "express";
import upload from "../middleware/upload.js";
import commentRoutes from "./commentRoutes.js";
import reactionRoutes from "./reactionRoutes.js";
import {
    createPost,
    getAllPosts,
    getPost,
    deletePost,
    keepAwake
} from "../controllers/postController.js";

const router = express.Router();
router.post("/", upload.single("image"), createPost);
router.get("/awake", keepAwake);
router.get("/", getAllPosts);
router.get("/:id", getPost);
router.delete("/:id", deletePost);
router.use("/", commentRoutes);
router.use("/", reactionRoutes);

export default router;
