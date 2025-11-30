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
 *     summary: Cast, change, or remove a vote.
 *     security:
 *       - bearerAuth: []
 *     tags: [Votes]
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
 *               target_id:
 *                 type: string
 *                 description: UUID or ObjectId.
 *               value:
 *                 type: integer
 *                 enum: [1, -1]
 *     responses:
 *       201:
 *         description: Vote created.
 *       200:
 *         description: Vote updated or removed.
 *       401:
 *         description: Unauthorized.
 *       429:
 *         description: Rate limit exceeded.
 */

router.post('/', protect, rateLimitVotes, castVote);

export default router;