import express from "express";
import { createUserAsync, readUserAsync, searchUserByEmailAsync } from "../controllers/userController";
import { checkPassword } from "../lib/crypt";
import { endSessionAsync, getSessionUserAsync, startSessionAsync } from "../controllers/sessionController";
import { getSessionToken } from "../lib/auth";

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
        if (!!user && await checkPassword(loginData.password, user.password, user.salt)) {
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
        } else {
            response.sendStatus(401);
        }
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
        if (loggedUserId) {
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
        } else {
            console.error("Session not found for token " + token);
            await endSessionAsync(token);
            response.status(404).send("Session not found");
        }
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

export default userRoutes;
