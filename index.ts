import express from "express";
import userRoutes from "./routes/userRoutes";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import placeRoutes from "./routes/placeRoutes";
import itineraryRoutes from "./routes/itinerariesRoutes";
import { getSessionToken } from "./lib/auth";
import { Server } from "socket.io";
import { handleSocketConnectAsync, handleSocketDisconnectAsync } from "./lib/socket";

const devServerPort = 3000;
const serverPort = 3001;
const serverAddress = "0.0.0.0";
const isDev = process.argv.includes("dev");
const corsOptions = {
    origin: `http://localhost:${isDev ? devServerPort : serverPort}`,
    credentials: true
};

const connectToDbAsync = async () => {
    await mongoose.connect("mongodb+srv://root:root@cluster0.vsfjdvq.mongodb.net/?retryWrites=true&w=majority");
}

const createExpressApp = () => {
    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.text());
    app.use(cors(corsOptions));
    app.use((req, res, next) => {
        console.log(`${req.method} to ${req.url} with token ${getSessionToken(req.headers.cookie)} with body ${JSON.stringify(req.body)}`);
        next();
    })
    app.use(userRoutes);
    app.use(placeRoutes);
    app.use(itineraryRoutes);

    if (isDev) {
        console.log("Redirect to dev at port " + devServerPort + " enabled!");
        app.get("/*", (req, res) => {
            res.redirect(req.url.replace("" + serverPort, "" + devServerPort));
        });
    } else {
        console.log("Started in production mode");
        app.use(express.static("static"));
        app.get("/*", (req, res, next) => {
            res.sendFile(__dirname + "/static/" + req.path);
        });
    }

    return app;
}

const startApp = async () => {
    await connectToDbAsync();
    const app = createExpressApp();
    const server = app.listen(serverPort, serverAddress, 1, () => console.log(`Listening on ${serverAddress}:${serverPort}`));
    const io = new Server(server, { cors: corsOptions });
    io.on("connection", handleSocketConnectAsync);
    io.on("disconnect", handleSocketDisconnectAsync);
}

startApp();