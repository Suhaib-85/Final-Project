// src/services/fastAPISyncService.js
import axios from 'axios';
import config from '../../config/index.js';

const sendIdempotentWebhook = async (endpoint, data, idempotencyKey) => {
    const url = `${config.FASTAPI_SYNC_URL}${endpoint}`;

    if (!idempotencyKey) {
        throw new Error("Idempotency Key (JTI) is required for critical sync operations.");
    }

    try {
        const response = await axios.post(url, data, {
            headers: {
                'X-Idempotency-Key': idempotencyKey,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Webhook failed for ${endpoint} (JTI: ${idempotencyKey}):`, error.message);
        throw new Error('Failed to synchronize data with upstream service.');
    }
};

export { sendIdempotentWebhook };