// src/routes/commentRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { rateLimitComments } from '../middleware/rateLimitMiddleware.js';
import { createComment, getComments, updateComment } from '../controllers/commentController.js';

const router = express.Router();

/**
 * @openapi
 * /comments:
 *   post:
 *     summary: Create a new comment or nested reply.
 *     security:
 *       - bearerAuth: []
 *     tags: [Comments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idea_id, body]
 *             properties:
 *               idea_id:
 *                 type: string
 *                 description: UUID of the idea the comment belongs to.
 *               parent_id:
 *                 type: string
 *                 nullable: true
 *                 description: Parent comment ObjectId (optional).
 *               body:
 *                 type: string
 *                 description: Comment content.
 *     responses:
 *       201:
 *         description: Comment created.
 *       429:
 *         description: Rate limit exceeded.
 */

router.post('/', protect, rateLimitComments, createComment);

/**
 * @openapi
 * /comments:
 *   get:
 *     summary: Get paginated top-level comments for an idea.
 *     tags: [Comments]
 *     parameters:
 *       - in: query
 *         name: idea_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Idea UUID.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated comments returned.
 */

router.get('/', getComments);

/**
 * @openapi
 * /comments/{id}:
 *   put:
 *     summary: Edit an existing comment.
 *     description: Only the author can edit within a defined timeframe.
 *     security:
 *       - bearerAuth: []
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ObjectId.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [body]
 *             properties:
 *               body:
 *                 type: string
 *                 description: Updated comment text.
 *     responses:
 *       200:
 *         description: Comment updated.
 *       403:
 *         description: Unauthorized or edit window expired.
 */

router.put('/:id', protect, updateComment);

export default router;