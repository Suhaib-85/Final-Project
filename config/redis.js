import Redis from 'ioredis';
import config from './index.js';

const redisClient = new Redis(config.REDIS_URL, {
    tls: { rejectUnauthorized: false }, // required for Upstash TLS
    maxRetriesPerRequest: 2
});

redisClient.on('connect', () => console.log('Redis Client Connected'));
redisClient.on('error', (err) => console.error('Redis Client Error', err));

export default redisClient;
