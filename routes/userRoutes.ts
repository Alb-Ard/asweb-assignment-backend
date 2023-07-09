import express from "express";
import { createUserAsync, deleteUserAsync, readUserAsync, searchUserByEmailAsync, updateUserAsync } from "../controllers/userController";
import { checkPassword } from "../lib/crypt";
import { endSessionAsync, getSessionUserAsync, startSessionAsync } from "../controllers/sessionController";
import { checkOwnershipAsync, getSessionToken } from "../lib/auth";
import { deleteReviewAsync, readUserReviewsAsync } from "../controllers/reviewController";
import { deleteItineraryAsync, readUserItinerariesAsync } from "../controllers/itineraryController";
import { deletePlaceAsync, readUserPlacesAsync } from "../controllers/placeController";
import { deleteNotificationAsync, readNotificationAsync, readUserNotificationsAsync, updateNotificationAsync } from "../controllers/notificationController";

const userRoutes = express.Router();

userRoutes.get("/api/user/:id/notification", async (request, response) => { 
    try {
        const sessionUserId = await getSessionUserAsync(getSessionToken(request.headers.cookie));
        if (!!!sessionUserId || sessionUserId != request.params.id) {
            response.sendStatus(401);
            return;
        }
        const notifications = await readUserNotificationsAsync(sessionUserId);
        response.send(notifications);
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});

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

userRoutes.patch("/api/user/:userId/notification/:notificationId", async (request, response) => {
    try {
        const existingNotification = await readNotificationAsync(request.params.notificationId);
        if (!!!existingNotification) {
            response.status(404).send("Notification not found");
            return;
        }
        if (!(await checkOwnershipAsync(existingNotification.user, request.headers.cookie)) || !(await checkOwnershipAsync(request.params.userId, request.headers.cookie))) {
            response.sendStatus(401);
            return;
        }
        const newNotificationData = request.body as Partial<{
            _id: string,
            read: boolean,
        }>;
        if (!!!newNotificationData || (!!newNotificationData._id && newNotificationData._id != existingNotification._id)) {
            response.sendStatus(400);
            return;
        }
        const success = await updateNotificationAsync(existingNotification._id, newNotificationData);
        response.status(success ? 200 : 500).send(success ? "OK" : "DB Error");
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});

userRoutes.delete("/api/user/:userId/notification/:notificationId", async (request, response) => {
    try {
        const existingNotification = await readNotificationAsync(request.params.notificationId);
        if (!!!existingNotification) {
            response.status(404).send("Notification not found");
            return;
        }
        if (!(await checkOwnershipAsync(existingNotification._id, request.headers.cookie)) || !(await checkOwnershipAsync(request.params.userId, request.headers.cookie))) {
            response.sendStatus(401);
            return;
        }
        const success = await deleteNotificationAsync(existingNotification._id);
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
        if (success) {
            const reviews = await readUserReviewsAsync(userId);
            for (const review of reviews) {
                await deleteReviewAsync(review._id);
            }
            let page = 0;
            do {
                const itineraries = await readUserItinerariesAsync(userId, page);
                for (const itinerary of itineraries) {
                    await deleteItineraryAsync(itinerary._id);
                }
                if (itineraries.length <= 0) {
                    break;
                }
                page++;
            } while (true);
            page = 0;
            do {
                const places = await readUserPlacesAsync(userId, page);
                for (const place of places) {
                    await deletePlaceAsync(place._id);
                }
                if (places.length <= 0) {
                    break;
                }
                page++;
            } while (true);
        }
        response.status(success ? 200 : 500).send(success ? "OK" : "DB Error");
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});

export default userRoutes;
