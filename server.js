import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import postRoutes from "./routes/postRoutes.js";

dotenv.config();
const app = express();
app.use(express.json());

connectDB();

app.use("/posts", postRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});