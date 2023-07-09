import { Socket } from "socket.io";
import { getSessionUserAsync } from "../controllers/sessionController";
import { getSessionToken } from "./auth";

const userSockets = new Map<string, Socket>();

export const handleSocketConnectAsync = async (socket: Socket) => {
    const userId = await getSessionUserAsync(getSessionToken(socket.request.headers.cookie));
    if (!!!userId) {
        console.log("Trying to open a user websocket with no logged user!");
        return;
    }
    console.log("WEBSOCKET opened for user " + userId);
    userSockets.set(userId, socket);
}

export const handleSocketDisconnectAsync = async (socket: Socket) => {
    const userId = await getSessionUserAsync(getSessionToken(socket.request.headers.cookie));
    if (!!!userId) {
        console.log("Trying to close a user websocket with no logged user!");
        return;
    }
    console.log("WEBSOCKET closed for user " + userId);
    userSockets.delete(userId);
}

export const sendMessageToClient = (userId: string, messageType: string, message: any) => {
    const socket = userSockets.get(userId);
    if (!!!socket) {
        console.log("WEBSOCKET no socket found for " + userId);
        return;
    }
    socket.emit(messageType, message);
}