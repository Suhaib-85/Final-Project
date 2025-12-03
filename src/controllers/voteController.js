// src/controllers/voteController.js
import Vote from '../models/Vote.js';
import asyncHandler from 'express-async-handler';
import { sendIdempotentWebhook } from '../services/fastAPISyncService.js';
import { invalidateIdeaCache } from '../services/notificationService.js';

/**
 * Helper function to calculate the total like and dislike counts for a target item.
 * @param {string} targetId 
 * @param {string} targetType 
 * @returns {object} { likeCount: number, dislikeCount: number }
 */
const aggregateVoteCounts = async (targetId, targetType) => {
    // MongoDB Aggregation Pipeline
    const results = await Vote.aggregate([
        { 
            $match: { 
                target_id: targetId, 
                target_type: targetType 
            } 
        },
        { 
            $group: {
                _id: '$target_id',
                // Sum 1 if value is 1 (like), else 0
                likeCount: { $sum: { $cond: [{ $eq: ['$value', 1] }, 1, 0] } }, 
                // Sum 1 if value is -1 (dislike), else 0
                dislikeCount: { $sum: { $cond: [{ $eq: ['$value', -1] }, 1, 0] } } 
            }
        }
    ]);

    // Return the aggregated result, or zero counts if no votes exist
    if (results.length > 0) {
        return {
            likeCount: results[0].likeCount,
            dislikeCount: results[0].dislikeCount
        };
    } else {
        return { likeCount: 0, dislikeCount: 0 };
    }
};


const castVote = asyncHandler(async (req, res) => {
    const { target_type, target_id, value } = req.body;
    const user_id = req.user.id;
    const jti = req.user.jti;
    const voteValue = parseInt(value);

    // Basic input validation
    if (!['idea', 'comment'].includes(target_type) || ![1, -1].includes(voteValue)) {
        return res.status(400).json({ message: 'Invalid target type or vote value.' });
    }

    const session = await Vote.startSession();
    session.startTransaction();

    let voteAction = 'cast'; 

    try {
        const existingVote = await Vote.findOne({ target_id, target_type, user_id }).session(session);

        if (existingVote) {
            if (existingVote.value === voteValue) {
                // Scenario 1: Toggling OFF (Removing vote)
                await existingVote.deleteOne({ session });
                voteAction = 'removed';
            } else {
                // Scenario 2: Toggling Direction (Changing vote)
                existingVote.value = voteValue;
                existingVote.jti = jti;
                await existingVote.save({ session });
                voteAction = 'changed';
            }
        } else {
            // Scenario 3: New Vote
            await Vote.create([{
                target_type,
                target_id,
                user_id,
                value: voteValue,
                jti
            }], { session });
            voteAction = 'cast';
        }

        await session.commitTransaction();

        // 1. AGGREGATE NEW TOTAL COUNTS
        const newCounts = await aggregateVoteCounts(target_id, target_type);

        // 2. CACHE INVALIDATION
        if (target_type === 'idea') {
            await invalidateIdeaCache(target_id);
        }

        // 3. SYNCHRONIZE TOTALS TO FASTAPI
        // Send the complete totals instead of deltas.
        await sendIdempotentWebhook('/stats/votes/sync', {
            target_id,
            target_type,
            likeCount: newCounts.likeCount,       
            dislikeCount: newCounts.dislikeCount, 
            jti
        }, jti);

        // 4. RETURN NEW TOTALS TO CLIENT
        res.status(voteAction === 'cast' ? 201 : 200).json({
            message: `Vote successfully ${voteAction}.`,
            likeCount: newCounts.likeCount,
            dislikeCount: newCounts.dislikeCount
        });

    } catch (error) {
        await session.abortTransaction();
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Duplicate vote attempt detected (JTI conflict).' });
        }
        // Throw other errors for generic handler
        throw error;
    } finally {
        session.endSession();
    }
});

export { castVote, aggregateVoteCounts };
