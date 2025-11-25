import express from "express";
import upload from "../middleware/upload.js";
import commentRoutes from "./commentRoutes.js";
import reactionRoutes from "./reactionRoutes.js";
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
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags:
 *       - Posts
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Post created
 *       400:
 *         description: Missing required fields
 */

router.post("/", upload.single("image"), createPost);
router.get("/awake", keepAwake);

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
 *         description: List of posts with pagination
 */

router.get("/", getAllPosts);

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

router.get("/:id", getPost);

/**
 * @openapi
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post by its ID
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
 *         description: Post deleted
 *       404:
 *         description: Post not found
 */

router.delete("/:id", deletePost);

router.use("/", commentRoutes);
router.use("/", reactionRoutes);

export default router;
