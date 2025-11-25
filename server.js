import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import cors from "cors";
import sanitizeInputs from "./middleware/sanitize.js";
import connectDB from "./config/db.js";
import postRoutes from "./routes/postRoutes.js";
import { swaggerDocs } from "./utils/swagger.js";  // <-- named import

dotenv.config();

export const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Rate limiting
app.use(rateLimit({
    windowMs: 2 * 60 * 1000,
    max: 100,
    message: "Too many requests, try again after a couple of minutes."
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Input sanitization
app.use(sanitizeInputs);

// Connect to DB
connectDB();

// Routes
app.use("/posts", postRoutes);

// Swagger docs
swaggerDocs(app);

// Start server
export const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
