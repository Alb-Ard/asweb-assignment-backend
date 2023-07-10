"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const crypt_1 = require("../lib/crypt");
const sessionController_1 = require("../controllers/sessionController");
const auth_1 = require("../lib/auth");
const reviewController_1 = require("../controllers/reviewController");
const itineraryController_1 = require("../controllers/itineraryController");
const placeController_1 = require("../controllers/placeController");
const notificationController_1 = require("../controllers/notificationController");
const userRoutes = express_1.default.Router();
userRoutes.get("/api/user/:id/notification", async (request, response) => {
    try {
        const sessionUserId = await (0, sessionController_1.getSessionUserAsync)((0, auth_1.getSessionToken)(request.headers.cookie));
        if (!!!sessionUserId || sessionUserId != request.params.id) {
            response.sendStatus(401);
            return;
        }
        const notifications = await (0, notificationController_1.readUserNotificationsAsync)(sessionUserId);
        response.send(notifications);
    }
    catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});
userRoutes.post("/api/user/register", async (request, response) => {
    try {
        const newUserData = request.body;
        await (0, userController_1.createUserAsync)(newUserData.username, newUserData.email, newUserData.password);
        response.sendStatus(200);
    }
    catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});
userRoutes.post("/api/user/login", async (request, response) => {
    try {
        const loginData = request.body;
        const user = await (0, userController_1.searchUserByEmailAsync)(loginData.email);
        if (!!!user) {
            response.sendStatus(404);
            return;
        }
        if (!(await (0, crypt_1.checkPassword)(loginData.password, user.password, user.salt))) {
            response.sendStatus(401);
            return;
        }
        const receivedToken = (0, auth_1.getSessionToken)(request.headers.cookie);
        const currentLoggedUserId = await (0, sessionController_1.getSessionUserAsync)(receivedToken);
        const { password, salt, ...userData } = user;
        if (currentLoggedUserId == user._id) {
            // Session is already active
            response.send(userData);
            return;
        }
        const sessionToken = await (0, sessionController_1.startSessionAsync)(user._id);
        response
            .cookie("sessionToken", sessionToken.token, {
            domain: request.hostname,
            expires: new Date(sessionToken.expiry),
            sameSite: "none",
            httpOnly: true,
            secure: true,
        })
            .send(userData);
    }
    catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});
userRoutes.post("/api/user/renew", async (request, response) => {
    try {
        console.log(request.headers.cookie);
        const token = (0, auth_1.getSessionToken)(request.headers.cookie);
        const loggedUserId = await (0, sessionController_1.getSessionUserAsync)(token);
        if (!!!loggedUserId) {
            console.error("Session not found for token " + token);
            await (0, sessionController_1.endSessionAsync)(token);
            response.status(404).send("Session not found");
            return;
        }
        console.log("Renweing session of user " + loggedUserId);
        const user = await (0, userController_1.readUserAsync)(loggedUserId);
        if (!!!user) {
            console.error("User not found?!");
            await (0, sessionController_1.endSessionAsync)(token);
            response.status(404).send("Session invalid");
            return;
        }
        console.log("Session valid");
        const { password, salt, ...userData } = user;
        response.send(userData);
    }
    catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});
userRoutes.post("/api/user/logout", async (request, response) => {
    try {
        const token = (0, auth_1.getSessionToken)(request.headers.cookie);
        if (await (0, sessionController_1.endSessionAsync)(token)) {
            response.sendStatus(200);
        }
        else {
            response.status(404).send("Session not found");
        }
    }
    catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});
userRoutes.patch("/api/user/:id", async (request, response) => {
    try {
        const { currentPassword, _id: userId, ...newUserData } = request.body;
        if (request.params.id != userId) {
            response.sendStatus(400);
            return;
        }
        const currentUserData = await (0, userController_1.readUserAsync)(userId);
        if (!!!currentUserData) {
            response.sendStatus(404);
            return;
        }
        if (!(0, crypt_1.checkPassword)(currentPassword, currentUserData.password, currentUserData.salt) || !(await (0, auth_1.checkOwnershipAsync)(userId, request.headers.cookie))) {
            response.sendStatus(401);
            return;
        }
        const success = await (0, userController_1.updateUserAsync)(userId, newUserData);
        response.status(success ? 200 : 500).send(success ? "OK" : "DB Error");
    }
    catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});
userRoutes.patch("/api/user/:userId/notification/:notificationId", async (request, response) => {
    try {
        const existingNotification = await (0, notificationController_1.readNotificationAsync)(request.params.notificationId);
        if (!!!existingNotification) {
            response.status(404).send("Notification not found");
            return;
        }
        if (!(await (0, auth_1.checkOwnershipAsync)(existingNotification.user, request.headers.cookie)) || !(await (0, auth_1.checkOwnershipAsync)(request.params.userId, request.headers.cookie))) {
            response.sendStatus(401);
            return;
        }
        const newNotificationData = request.body;
        if (!!!newNotificationData || (!!newNotificationData._id && newNotificationData._id != existingNotification._id)) {
            response.sendStatus(400);
            return;
        }
        const success = await (0, notificationController_1.updateNotificationAsync)(existingNotification._id, newNotificationData);
        response.status(success ? 200 : 500).send(success ? "OK" : "DB Error");
    }
    catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});
userRoutes.delete("/api/user/:userId/notification/:notificationId", async (request, response) => {
    try {
        const existingNotification = await (0, notificationController_1.readNotificationAsync)(request.params.notificationId);
        if (!!!existingNotification) {
            response.status(404).send("Notification not found");
            return;
        }
        if (!(await (0, auth_1.checkOwnershipAsync)(existingNotification._id, request.headers.cookie)) || !(await (0, auth_1.checkOwnershipAsync)(request.params.userId, request.headers.cookie))) {
            response.sendStatus(401);
            return;
        }
        const success = await (0, notificationController_1.deleteNotificationAsync)(existingNotification._id);
        response.status(success ? 200 : 500).send(success ? "OK" : "DB Error");
    }
    catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});
userRoutes.delete("/api/user/:id", async (request, response) => {
    try {
        const userId = request.params.id;
        const userData = await (0, userController_1.readUserAsync)(userId);
        if (!!!userData) {
            response.sendStatus(404);
            return;
        }
        if (!(await (0, auth_1.checkOwnershipAsync)(userId, request.headers.cookie))) {
            response.sendStatus(401);
            return;
        }
        const success = await (0, userController_1.deleteUserAsync)(userId);
        if (success) {
            const reviews = await (0, reviewController_1.readUserReviewsAsync)(userId);
            for (const review of reviews) {
                await (0, reviewController_1.deleteReviewAsync)(review._id);
            }
            let page = 0;
            do {
                const itineraries = await (0, itineraryController_1.readUserItinerariesAsync)(userId, page);
                for (const itinerary of itineraries) {
                    await (0, itineraryController_1.deleteItineraryAsync)(itinerary._id);
                }
                if (itineraries.length <= 0) {
                    break;
                }
                page++;
            } while (true);
            page = 0;
            do {
                const places = await (0, placeController_1.readUserPlacesAsync)(userId, page);
                for (const place of places) {
                    await (0, placeController_1.deletePlaceAsync)(place._id);
                }
                if (places.length <= 0) {
                    break;
                }
                page++;
            } while (true);
        }
        response.status(success ? 200 : 500).send(success ? "OK" : "DB Error");
    }
    catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});
exports.default = userRoutes;
