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
import { existsSync } from "fs";

const isDev = process.argv.includes("dev");
const devServerPort = 3000;
const serverPort = isDev ? 3001 : Number(process.env.PORT ?? "80");
const serverAddress = "0.0.0.0";
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
            const redirectUrl = req.headers.host + req.url.replace("" + serverPort, "" + devServerPort);
            console.log("Request for page redirected to \"" + redirectUrl + "\"");
            res.redirect(redirectUrl);
        });
    } else {
        console.log("Started in production mode");
        app.use(express.static("static"));
        app.get("/*", (req, res, next) => {
            const filePath = __dirname + "/static/" + req.path;
            if (existsSync(filePath)) {
                res.sendFile(__dirname + "/static/" + req.path);
            } else {
                res.sendFile(__dirname + "/static/404.html");
            }
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