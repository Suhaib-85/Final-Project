// src/controllers/voteController.js
import Vote from '../models/Vote.js';
import asyncHandler from 'express-async-handler';
import { sendIdempotentWebhook } from '../services/fastAPISyncService.js';
import { invalidateIdeaCache } from '../services/notificationService.js';

const castVote = asyncHandler(async (req, res) => {
    const { target_type, target_id, value } = req.body;
    const user_id = req.user.id;
    const jti = req.user.jti;
    const voteValue = parseInt(value);

    if (!['idea', 'comment'].includes(target_type) || ![1, -1].includes(voteValue)) {
        return res.status(400).json({ message: 'Invalid target type or vote value.' });
    }

    const session = await Vote.startSession();
    session.startTransaction();

    let voteDelta = 0;
    let likesDelta = 0;
    let dislikesDelta = 0;
    try {
        const existingVote = await Vote.findOne({ target_id, target_type, user_id }).session(session);

        if (existingVote) {
            if (existingVote.value === voteValue) {
                await existingVote.deleteOne({ session });
                voteDelta = -voteValue;
                if (voteValue === 1) {
                    likesDelta = -1;
                } else {
                    dislikesDelta = -1;
                }
                res.status(200).json({ message: 'Vote removed.', delta: [ voteDelta, likesDelta, dislikesDelta ]});
            } else {
                const oldVoteValue = existingVote.value;
                existingVote.value = voteValue;
                existingVote.jti = jti;
                await existingVote.save({ session });
                voteDelta = voteValue - oldVoteValue;
                if (oldVoteValue === 1) {
                    likesDelta = -1;
                    dislikesDelta = 1;
                } else {
                    likesDelta = 1;
                    dislikesDelta = -1;
                }
                res.status(200).json({ message: 'Vote changed.', delta: [ voteDelta, likesDelta, dislikesDelta ]});
            }
        } else {
            await Vote.create([{
                target_type,
                target_id,
                user_id,
                value: voteValue,
                jti
            }], { session });
            voteDelta = voteValue;
            if (voteValue === 1) {
                likesDelta = 1;
            } else {
                dislikesDelta = 1;
            }
            res.status(201).json({ message: 'Vote cast.', delta: [ voteDelta, likesDelta, dislikesDelta ]});
        }

        await session.commitTransaction();

        if (target_type === 'idea') {
            await invalidateIdeaCache(target_id);
        }

        await sendIdempotentWebhook('/stats/votes/sync', {
            target_id,
            target_type,
            delta: voteDelta,
            jti
        }, jti);

    } catch (error) {
        await session.abortTransaction();
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Duplicate vote attempt detected (JTI conflict).' });
        }
        throw error;
    } finally {
        session.endSession();
    }
});

export { castVote };
