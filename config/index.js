// config/index.js
import 'dotenv/config'; // Use /config to load variables globally

const config = {
    PORT: process.env.PORT || 5000,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    FRONTEND_URL: process.env.FRONTEND_URL,
    FASTAPI_SYNC_URL: process.env.FASTAPI_SYNC_URL
};

export default config;