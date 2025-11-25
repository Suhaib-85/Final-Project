// routes/commentRoutes.js
import express from "express";
import {
    createComment,
    getCommentsForPost,
    deleteComment,
} from "../controllers/commentController.js";

const router = express.Router({ mergeParams: true });

router.post("/:postId/comments", createComment);
router.get("/:postId/comments", getCommentsForPost);

// separate route to delete comment by id
router.delete("/comment/:commentId", deleteComment);

export default router;
