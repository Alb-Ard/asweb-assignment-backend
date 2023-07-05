import express from "express";
import userRoutes from "./routes/userRoutes";
import mongoose from "mongoose";

const connectToDbAsync = async () => {
    await mongoose.connect("mongodb+srv://root:root@cluster0.vsfjdvq.mongodb.net/?retryWrites=true&w=majority");
}

const startApp = async () => {
    await connectToDbAsync();
    const app = express();
    app.use(userRoutes);
    app.listen(3001, "localhost", 1, () => console.log("Listening on localhost:3001"));
}

startApp();