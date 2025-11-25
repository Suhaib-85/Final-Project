// routes/commentRoutes.js
import express from "express";
import {
    createComment,
    getCommentsForPost,
    deleteComment,
} from "../controllers/commentController.js";

const router = express.Router({ mergeParams: true });

/**
 * @openapi
 * /comments:
 *   post:
 *     summary: Add a comment to a post
 *     tags:
 *       - Comments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *               userId:
 *                 type: string
 *               body:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added
 *       400:
 *         description: Missing required fields
 */

router.post("/:postId/comments", createComment);

/**
 * @openapi
 * /comments/{postId}:
 *   get:
 *     summary: Get all available comments for a post
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB _id of the post
 *     responses:
 *       200:
 *         description: List of comments
 *       404:
 *         description: Post not found
 */

router.get("/:postId/comments", getCommentsForPost);

// separate route to delete comment by id

/**
 * @openapi
 * /comments/comment/{commentId}:
 *   delete:
 *     summary: Delete a comment by its ID
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB _id of the comment
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       404:
 *         description: Comment not found
 */

router.delete("/comment/:commentId", deleteComment);

export default router;
