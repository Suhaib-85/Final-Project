// routes/reactionRoutes.js
import express from "express";
import { toggleReaction, getReactionCounts } from "../controllers/reactionController.js";

const router = express.Router();

router.post("/:postId/reaction", toggleReaction);
router.get("/:postId/reaction", getReactionCounts);

export default router;
