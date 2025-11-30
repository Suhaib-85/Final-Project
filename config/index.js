import 'dotenv/config';

const config = {
    PORT: Number(process.env.PORT) || 5000,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    REDIS_URL: process.env.REDIS_URL, // <-- add this
    FRONTEND_URL: process.env.FRONTEND_URL,
    FASTAPI_SYNC_URL: process.env.FASTAPI_SYNC_URL
};

export default config;
