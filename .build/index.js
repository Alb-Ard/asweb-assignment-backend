"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const placeRoutes_1 = __importDefault(require("./routes/placeRoutes"));
const itinerariesRoutes_1 = __importDefault(require("./routes/itinerariesRoutes"));
const auth_1 = require("./lib/auth");
const socket_io_1 = require("socket.io");
const socket_1 = require("./lib/socket");
const fs_1 = require("fs");
const isDev = process.argv.includes("dev");
const devServerPort = 3000;
const serverPort = isDev ? 3001 : Number(process.env.PORT ?? "80");
const serverAddress = "0.0.0.0";
const corsOptions = {
    origin: `http://localhost:${isDev ? devServerPort : serverPort}`,
    credentials: true
};
const connectToDbAsync = async () => {
    await mongoose_1.default.connect("mongodb+srv://root:root@cluster0.vsfjdvq.mongodb.net/?retryWrites=true&w=majority");
};
const createExpressApp = () => {
    const app = (0, express_1.default)();
    app.use(body_parser_1.default.json());
    app.use(body_parser_1.default.text());
    app.use((0, cors_1.default)(corsOptions));
    app.use((req, res, next) => {
        console.log(`${req.method} to ${req.url} with token ${(0, auth_1.getSessionToken)(req.headers.cookie)} with body ${JSON.stringify(req.body)}`);
        next();
    });
    app.use(userRoutes_1.default);
    app.use(placeRoutes_1.default);
    app.use(itinerariesRoutes_1.default);
    if (isDev) {
        console.log("Redirect to dev at port " + devServerPort + " enabled!");
        app.get("/*", (req, res) => {
            const redirectUrl = req.headers.host + req.url.replace("" + serverPort, "" + devServerPort);
            console.log("Request for page redirected to \"" + redirectUrl + "\"");
            res.redirect(redirectUrl);
        });
    }
    else {
        console.log("Started in production mode");
        app.use(express_1.default.static("static"));
        app.get("/*", (req, res, next) => {
            const filePath = __dirname + "/static/" + req.path;
            if ((0, fs_1.existsSync)(filePath)) {
                res.sendFile(__dirname + "/static/" + req.path);
            }
            else {
                res.sendFile(__dirname + "/static/404.html");
            }
        });
    }
    return app;
};
const startApp = async () => {
    await connectToDbAsync();
    const app = createExpressApp();
    const server = app.listen(serverPort, serverAddress, 1, () => console.log(`Listening on ${serverAddress}:${serverPort}`));
    const io = new socket_io_1.Server(server, { cors: corsOptions });
    io.on("connection", socket_1.handleSocketConnectAsync);
    io.on("disconnect", socket_1.handleSocketDisconnectAsync);
};
startApp();
