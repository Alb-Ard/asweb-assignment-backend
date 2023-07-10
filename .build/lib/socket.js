"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageToClient = exports.handleSocketDisconnectAsync = exports.handleSocketConnectAsync = void 0;
const sessionController_1 = require("../controllers/sessionController");
const auth_1 = require("./auth");
const userSockets = new Map();
const handleSocketConnectAsync = async (socket) => {
    const userId = await (0, sessionController_1.getSessionUserAsync)((0, auth_1.getSessionToken)(socket.request.headers.cookie));
    if (!!!userId) {
        console.log("Trying to open a user websocket with no logged user!");
        return;
    }
    console.log("WEBSOCKET opened for user " + userId);
    userSockets.set(userId, socket);
};
exports.handleSocketConnectAsync = handleSocketConnectAsync;
const handleSocketDisconnectAsync = async (socket) => {
    const userId = await (0, sessionController_1.getSessionUserAsync)((0, auth_1.getSessionToken)(socket.request.headers.cookie));
    if (!!!userId) {
        console.log("Trying to close a user websocket with no logged user!");
        return;
    }
    console.log("WEBSOCKET closed for user " + userId);
    userSockets.delete(userId);
};
exports.handleSocketDisconnectAsync = handleSocketDisconnectAsync;
const sendMessageToClient = (userId, messageType, message) => {
    const socket = userSockets.get(userId);
    if (!!!socket) {
        console.log("WEBSOCKET no socket found for " + userId);
        return;
    }
    socket.emit(messageType, message);
};
exports.sendMessageToClient = sendMessageToClient;
