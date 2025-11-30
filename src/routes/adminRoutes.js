// src/routes/adminRoutes.js
import express from 'express';
import { protect, requireModerator } from '../middleware/authMiddleware.js';
import { deleteCommentByModerator } from '../controllers/adminController.js';

const router = express.Router();

/**
 * @openapi
 * /admin/comments/{id}:
 *   delete:
 *     summary: Moderator action to delete (soft-delete) a comment.
 *     security:
 *       - bearerAuth: []
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The comment ObjectId.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment soft-deleted successfully.
 *       403:
 *         description: User does not have moderator privileges.
 */

router.delete('/comments/:id', protect, requireModerator, deleteCommentByModerator);

export default router;