import express from "express";
import { createUserAsync, deleteUserAsync, readUserAsync, searchUserByEmailAsync, updateUserAsync } from "../controllers/userController";
import { checkPassword } from "../lib/crypt";
import { endSessionAsync, getSessionUserAsync, startSessionAsync } from "../controllers/sessionController";
import { checkOwnershipAsync, getSessionToken } from "../lib/auth";

const userRoutes = express.Router();

userRoutes.post("/api/user/register", async (request, response) => {
    try {
        const newUserData = request.body as { username: string, email: string, password: string };
        await createUserAsync(newUserData.username, newUserData.email, newUserData.password);
        response.sendStatus(200);
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});

userRoutes.post("/api/user/login", async (request, response) => {
    try {
        const loginData = request.body as { email: string, password: string };
        const user = await searchUserByEmailAsync(loginData.email);
        if (!!!user) {
            response.sendStatus(404);
            return;
        }
        if (!(await checkPassword(loginData.password, user.password, user.salt))) {
            response.sendStatus(401);
            return;
        }
        const receivedToken = getSessionToken(request.headers.cookie);
        const currentLoggedUserId = await getSessionUserAsync(receivedToken);
        const { password, salt, ...userData } = user;
        if (currentLoggedUserId == user._id) {
            // Session is already active
            response.send(userData);
            return;
        }
        const sessionToken = await startSessionAsync(user._id);
        response
            .cookie("sessionToken", sessionToken.token, {
                domain: request.hostname,
                expires: new Date(sessionToken.expiry),
                sameSite: "none",
                httpOnly: true,
                secure: true,
            })
            .send(userData);
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});

userRoutes.post("/api/user/renew", async (request, response) => {
    try {
        console.log(request.headers.cookie);
        const token = getSessionToken(request.headers.cookie);
        const loggedUserId = await getSessionUserAsync(token);
        if (!!!loggedUserId) {
            console.error("Session not found for token " + token);
            await endSessionAsync(token);
            response.status(404).send("Session not found");
            return;
        }
        console.log("Renweing session of user " + loggedUserId);
        const user = await readUserAsync(loggedUserId);
        if (!!!user) {
            console.error("User not found?!");
            await endSessionAsync(token);
            response.status(404).send("Session invalid");
            return;
        }
        console.log("Session valid");
        const { password, salt, ...userData } = user;
        response.send(userData);
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});

userRoutes.post("/api/user/logout", async (request, response) => {
    try {
        const token = getSessionToken(request.headers.cookie);
        if (await endSessionAsync(token)) {
            response.sendStatus(200);
        } else {
            response.status(404).send("Session not found");
        }
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});

userRoutes.patch("/api/user/:id", async (request, response) => {
    try {
        const { currentPassword, _id: userId, ...newUserData } = request.body as { _id: string, username?: string, email?: string, password?: string, currentPassword: string };
        if (request.params.id != userId) {
            response.sendStatus(400);
            return;
        }
        const currentUserData = await readUserAsync(userId);
        if (!!!currentUserData) {
            response.sendStatus(404);
            return;
        }
        if (!checkPassword(currentPassword, currentUserData.password, currentUserData.salt) || !(await checkOwnershipAsync(userId, request.headers.cookie))) {
            response.sendStatus(401);
            return;
        }
        const success = await updateUserAsync(userId, newUserData);
        response.status(success ? 200 : 500).send(success ? "OK" : "DB Error");
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});


userRoutes.delete("/api/user/:id", async (request, response) => {
    try {
        const userId = request.params.id;
        const userData = await readUserAsync(userId);
        if (!!!userData) {
            response.sendStatus(404);
            return;
        }
        if (!(await checkOwnershipAsync(userId, request.headers.cookie))) {
            response.sendStatus(401);
            return;
        }
        const success = await deleteUserAsync(userId);
        response.status(success ? 200 : 500).send(success ? "OK" : "DB Error");
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});

export default userRoutes;
