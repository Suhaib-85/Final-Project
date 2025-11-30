// config/redis.js
import Redis from 'ioredis';
import config from './index.js';

const redisClient = new Redis({
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    password: config.REDIS_PASSWORD,
    tls: {
        rejectUnauthorized: false
    },
    maxRetriesPerRequest: 2
});

redisClient.on('connect', () => console.log('Redis Client Connected'));
redisClient.on('error', (err) => console.error('Redis Client Error', err));

export default redisClient;