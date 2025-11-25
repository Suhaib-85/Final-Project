// routes/reactionRoutes.js
import express from "express";
import { toggleReaction, getReactionCounts } from "../controllers/reactionController.js";

const router = express.Router();

/**
 * @openapi
 * /reactions:
 *   post:
 *     summary: Like or dislike a post
 *     tags:
 *       - Reactions
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
 *               reaction:
 *                 type: string
 *                 enum: [like, dislike]
 *     responses:
 *       200:
 *         description: Reaction added or updated
 *       400:
 *         description: Missing or invalid fields
 */

router.post("/:postId/reaction", toggleReaction);

/**
 * @openapi
 * /reactions/{postId}/reaction:
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
 *       404:
 *         description: Post not found
 */

router.get("/:postId/reaction", getReactionCounts);

export default router;
