import express from "express";
import { createUserAsync, searchUserByEmailAsync } from "../controllers/userController";
import { checkPassword } from "../lib/crypt";
import { endSessionAsync, getSessionUserAsync, startSessionAsync } from "../controllers/sessionController";

const userRoutes = express.Router();

userRoutes.put("/api/user/register", async (request, response) => {
    try {
        const newUserData = request.body as { username: string, email: string, password: string };
        await createUserAsync(newUserData.username, newUserData.email, newUserData.password);
        response.sendStatus(200).send();
    } catch (err) {
        response.status(500).send(err);
    }
});

userRoutes.post("/api/user/login", async (request, response) => {
    try {
        const loginData = request.body as { email: string, password: string };
        const user = await searchUserByEmailAsync(loginData.email);
        if (!!user && await checkPassword(loginData.password, user.password, user.salt)) {
            const currentLoggedUserId = await getSessionUserAsync(request.cookies?.sessionToken);
            const { password, salt, ...userData } = user;
            if (currentLoggedUserId === user.id) {
                // Session is already active
                response.send(userData);
                return;
            }
            const sessionToken = await startSessionAsync(user.id);
            response.cookie("sessionToken", sessionToken.token, {
                path: "/",
                expires: new Date(sessionToken.expiry),
                httpOnly: true,
                secure: false, // Set to true if in HTTPS
            })
            response.send(userData);
        } else {
            response.sendStatus(403).send();
        }
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});

userRoutes.get("/api/user/logout", async (request, response) => {
    try {
        if (await endSessionAsync(request.cookies?.sessionToken)) {
            response.sendStatus(200).send();
        } else {
            response.status(404).send("Session not found");
        }
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});

export default userRoutes;
