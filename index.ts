import express from "express";
import userRoutes from "./routes/userRoutes";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import placeRoutes from "./routes/placeRoutes";

const connectToDbAsync = async () => {
    await mongoose.connect("mongodb+srv://root:root@cluster0.vsfjdvq.mongodb.net/?retryWrites=true&w=majority");
}

const startApp = async () => {
    await connectToDbAsync();
    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.text());
    app.use(cors({
        origin: "http://localhost:3000",
        credentials: true
    }));
    app.use(userRoutes);
    app.use(placeRoutes);
    app.listen(3001, "localhost", 1, () => console.log("Listening on localhost:3001"));
}

startApp();