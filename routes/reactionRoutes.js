// reactionRoutes.js
import { writeLimit, readLimit } from "../middleware/limiter.js";
import express from "express";
import { toggleReaction, getReactionCounts } from "../controllers/reactionController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/**
 * @openapi
 * /reactions/{postId}:
 *   post:
 *     summary: Like or dislike a post (toggle reaction)
 *     tags:
 *       - Reactions
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
 *               reaction:
 *                 type: string
 *                 enum: [like, dislike]
 *                 description: Reaction type (like or dislike)
 *     responses:
 *       201:
 *         description: Reaction added
 *       200:
 *         description: Reaction removed or updated
 *       400:
 *         description: Missing or invalid fields
 *       404:
 *         description: Post not found
 */
router.post("/:postId", writeLimit, protect, toggleReaction);

/**
 * @openapi
 * /reactions/{postId}:
 *   get:
 *     summary: Get total likes and dislikes for a post
 *     tags:
 *       - Reactions
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB _id of the post
 *     responses:
 *       200:
 *         description: Reaction counts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 likes:
 *                   type: integer
 *                 dislikes:
 *                   type: integer
 *                 total:
 *                   type: integer
 *       404:
 *         description: Post not found
 */
router.get("/:postId", readLimit, protect, getReactionCounts);

export default router;
