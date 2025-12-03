// src/routes/voteRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { rateLimitVotes } from '../middleware/rateLimitMiddleware.js';
import { castVote } from '../controllers/voteController.js';

const router = express.Router();

/**
 * @openapi
 * /votes:
 *   post:
 *     summary: Cast, change, or remove a vote on an idea or comment.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Votes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [target_type, target_id, value]
 *             properties:
 *               target_type:
 *                 type: string
 *                 enum: [idea, comment]
 *                 example: idea
 *                 description: Type of item being voted on.
 *               target_id:
 *                 type: string
 *                 description: UUID of the idea or ObjectId of the comment.
 *                 example: "fa53b41a-e47a-4785-ba44-53be3c4cc90e"
 *               value:
 *                 type: number
 *                 enum: [1, -1]
 *                 description: 1 for upvote/like, -1 for downvote/dislike.
 *                 example: 1
 *     responses:
 *       201:
 *         description: New vote cast successfully. Returns updated total counts.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 likeCount:
 *                   type: integer
 *                   description: The new total number of upvotes for the target item.
 *                 dislikeCount:
 *                   type: integer
 *                   description: The new total number of downvotes for the target item.
 *       200:
 *         description: Vote changed or removed successfully. Returns updated total counts.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 likeCount:
 *                   type: integer
 *                 dislikeCount:
 *                   type: integer
 *       401:
 *         description: Unauthorized.
 *       429:
 *         description: Rate limit exceeded (120 votes/hr).
 */

router.post('/', protect, rateLimitVotes, castVote);

export default router;
