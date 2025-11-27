// postRoutes.js
import { writeLimit, readLimit } from "../middleware/limiter.js";
import express from "express";
import upload from "../middleware/upload.js";
import { protect } from "../middleware/auth.js";
import {
    createPost,
    getAllPosts,
    getPost,
    deletePost,
    keepAwake
} from "../controllers/postController.js";

const router = express.Router();

/**
 * @openapi
 * /posts/awake:
 *   get:
 *     summary: Keep the server awake (health check)
 *     tags:
 *       - Posts
 *     responses:
 *       200:
 *         description: Server awake confirmation
 */
router.get("/awake", keepAwake);

/**
 * @openapi
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the post
 *               body:
 *                 type: string
 *                 description: Content of the post
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
 *     responses:
 *       201:
 *         description: Post created
 *       400:
 *         description: Missing required fields or image
 */
router.post("/", writeLimit, protect, upload.single("image"), createPost);

/**
 * @openapi
 * /posts:
 *   get:
 *     summary: Get paginated list of all available posts
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: List of posts with pagination info
 */
router.get("/", readLimit, getAllPosts);

/**
 * @openapi
 * /posts/{id}:
 *   get:
 *     summary: Get a single post by its ID
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB _id of the post
 *     responses:
 *       200:
 *         description: Single post object
 *       404:
 *         description: Post not found
 */
router.get("/:id", readLimit, getPost);

/**
 * @openapi
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post by its ID
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB _id of the post
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       404:
 *         description: Post not found
 */
router.delete("/:id", writeLimit, protect, deletePost);

export default router;
