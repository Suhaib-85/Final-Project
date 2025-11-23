import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import cors from "cors";
import sanitizeInputs from "./middleware/sanitize.js";
import connectDB from "./config/db.js";
import postRoutes from "./routes/postRoutes.js";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Security headers
app.use(helmet());

// CORS — restrict to your frontend
app.use(cors({
    origin: "https://your-frontend.com", // replace with your frontend URL
    methods: ["GET","POST","PUT","DELETE","PATCH"],
    allowedHeaders: ["Content-Type","Authorization"]
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 2 * 60 * 1000, // 2 minutes
    max: 100,
    message: "Too many requests, try again after a couple of minutes."
});
app.use(limiter);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Input sanitization
app.use(sanitizeInputs);

// Connect to MongoDB Atlas
connectDB();

// Routes
app.use("/posts", postRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
