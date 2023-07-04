import express from "express";
import userRoutes from "./routes/userRoutes";
import mongoose from "mongoose";

const connectToDbAsync = async () => {
    // TODO
    await mongoose.connect("");
}

connectToDbAsync();
const app = express();
app.use(userRoutes);
app.listen(3000, "localhost", 1, () => console.log("Listening on localhost:3000"));