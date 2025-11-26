// commentRoutes.js
import { writeLimit, readLimit } from "../middleware/limiter.js";
import express from "express";
import { createComment, getCommentsForPost, deleteComment } from "../controllers/commentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router({ mergeParams: true });

/**
 * @openapi
 * /comments/{postId}:
 *   post:
 *     summary: Add a comment to a post
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB _id of the post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: Comment text
 *     responses:
 *       201:
 *         description: Comment created
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Post not found
 */
router.post("/:postId", writeLimit, protect, createComment);

/**
 * @openapi
 * /comments/{postId}:
 *   get:
 *     summary: Get all comments for a post (paginated)
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB _id of the post
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of comments per page
 *     responses:
 *       200:
 *         description: List of comments with pagination info
 *       404:
 *         description: Post not found
 */
router.get("/:postId", readLimit, protect, getCommentsForPost);

/**
 * @openapi
 * /comments/{commentId}:
 *   delete:
 *     summary: Delete a comment by its ID
 *     description: Only the comment author or the parent post author can delete the comment.
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
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
 *       403:
 *         description: Not authorized to delete this comment (not owner of comment or post)
 *       404:
 *         description: Comment or parent post not found
 */

router.delete("/:commentId", writeLimit, protect, deleteComment);

export default router;
