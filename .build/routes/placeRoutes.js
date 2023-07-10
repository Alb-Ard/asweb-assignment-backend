"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const placeController_1 = require("../controllers/placeController");
const sessionController_1 = require("../controllers/sessionController");
const auth_1 = require("../lib/auth");
const reviewController_1 = require("../controllers/reviewController");
const notify_1 = require("../lib/notify");
const placeRoutes = express_1.default.Router();
placeRoutes.post("/api/place", async (request, response) => {
    try {
        const sessionUserId = await (0, sessionController_1.getSessionUserAsync)((0, auth_1.getSessionToken)(request.headers.cookie));
        const place = request.body;
        if (!!!sessionUserId || place.owner !== sessionUserId) {
            response.sendStatus(401);
            return;
        }
        const createdId = await (0, placeController_1.createPlaceAsync)(place.owner, place.name, place.location);
        if (!!!createdId) {
            response.sendStatus(500);
            return;
        }
        response.send(createdId);
    }
    catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});
placeRoutes.post("/api/place/:id/review", async (request, response) => {
    try {
        const placeId = request.params.id;
        const place = await (0, placeController_1.readPlaceAsync)(placeId);
        if (!place) {
            response.sendStatus(404);
            return;
        }
        const sessionUserId = await (0, sessionController_1.getSessionUserAsync)((0, auth_1.getSessionToken)(request.headers.cookie));
        if (!!!sessionUserId) {
            response.sendStatus(401);
            return;
        }
        const reviewData = request.body;
        const existingReview = await (0, reviewController_1.readReviewAsync)(placeId, sessionUserId);
        if (existingReview) {
            const success = await (0, reviewController_1.updateReviewAsync)(existingReview._id, reviewData);
            response.status(success ? 200 : 500).send(success ? existingReview._id : "DB Error");
            (0, notify_1.notifyChangedReviewAsync)(placeId, sessionUserId);
            return;
        }
        const createdId = await (0, reviewController_1.createReviewAsync)(reviewData.star, request.params.id, sessionUserId);
        if (!!!createdId) {
            response.sendStatus(500);
            return;
        }
        response.send(createdId);
        (0, notify_1.notifyNewReviewAsync)(placeId, sessionUserId);
    }
    catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});
placeRoutes.get("/api/place/", async (request, response) => {
    try {
        const places = await Promise.all((await (0, placeController_1.readAllPlacesAsync)(Number(request.query.page ?? "0")))
            .map(async (place) => ({
            ...place,
            reviews: await (0, reviewController_1.readPlaceReviewsAsync)(place._id),
        })));
        response.send(places);
    }
    catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});
placeRoutes.get("/api/place/:id", async (request, response) => {
    try {
        const place = await (0, placeController_1.readPlaceAsync)(request.params.id);
        if (!!!place) {
            response.sendStatus(404);
            return;
        }
        response.send({
            ...place,
            reviews: await (0, reviewController_1.readPlaceReviewsAsync)(place._id),
        });
    }
    catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});
placeRoutes.get("/api/place/:placeId/review/:reviewId", async (request, response) => {
    try {
        const place = await (0, placeController_1.readPlaceAsync)(request.params.placeId);
        if (!!!place) {
            response.status(404).send("Place not found");
            return;
        }
        const review = place.reviews.find(r => r._id == request.params.reviewId);
        if (!!!review) {
            response.status(404).send("Review not found in place");
            return;
        }
        response.send(review);
    }
    catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});
placeRoutes.patch("/api/place/:id", async (request, response) => {
    try {
        const place = request.body;
        if (!!!place) {
            response.sendStatus(400);
            return;
        }
        const { _id: placeId, ...placeData } = place;
        if (!!placeId && placeId !== request.params.id) {
            response.sendStatus(400);
            return;
        }
        const existingPlace = await (0, placeController_1.readPlaceAsync)(request.params.id);
        if (!!!existingPlace) {
            response.sendStatus(404);
            return;
        }
        if (!(await (0, auth_1.checkOwnershipAsync)(existingPlace.owner._id, request.headers.cookie))) {
            response.sendStatus(401);
            return;
        }
        const success = await (0, placeController_1.updatePlaceAsync)(request.params.id, placeData);
        response.status(success ? 200 : 500).send(success ? "OK" : "DB Error");
    }
    catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});
placeRoutes.delete("/api/place/:id", async (request, response) => {
    try {
        const placeId = request.params.id;
        const place = await (0, placeController_1.readPlaceAsync)(placeId);
        if (!!!place) {
            response.sendStatus(404);
            return;
        }
        if (!(await (0, auth_1.checkOwnershipAsync)(place.owner._id, request.headers.cookie))) {
            response.sendStatus(401);
            return;
        }
        const success = await (0, placeController_1.deletePlaceAsync)(placeId);
        if (success) {
            for (const review of place.reviews) {
                await (0, reviewController_1.deleteReviewAsync)(review._id);
            }
        }
        response.status(success ? 200 : 500).send(success ? "OK" : "DB Error");
    }
    catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});
placeRoutes.delete("/api/place/:placeId/review/", async (request, response) => {
    try {
        const place = await (0, placeController_1.readPlaceAsync)(request.params.placeId);
        if (!!!place) {
            response.status(404).send("Place not found");
            return;
        }
        const currentUserId = await (0, sessionController_1.getSessionUserAsync)((0, auth_1.getSessionToken)(request.headers.cookie));
        if (!!!currentUserId) {
            response.sendStatus(401);
            return;
        }
        const review = await (0, reviewController_1.readReviewAsync)(place._id, currentUserId);
        if (!!!review) {
            response.status(404).send("Review not found for user in place");
            return;
        }
        const success = await (0, reviewController_1.deleteReviewAsync)(review._id);
        response.status(success ? 200 : 500).send(success ? "OK" : "DB Error");
    }
    catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});
placeRoutes.delete("/api/place/:placeId/review/:reviewId", async (request, response) => {
    try {
        const place = await (0, placeController_1.readPlaceAsync)(request.params.placeId);
        if (!!!place) {
            response.status(404).send("Place not found");
            return;
        }
        const currentUserId = await (0, sessionController_1.getSessionUserAsync)((0, auth_1.getSessionToken)(request.headers.cookie));
        if (!!!currentUserId) {
            response.sendStatus(401);
            return;
        }
        const review = await (0, reviewController_1.readReviewAsync)(place._id, currentUserId);
        if (!!!review || review._id != request.params.reviewId) {
            response.status(404).send("Review not found in place");
            return;
        }
        if (review.user._id != currentUserId) {
            response.sendStatus(401);
            return;
        }
        const success = await (0, reviewController_1.deleteReviewAsync)(review._id);
        response.status(success ? 200 : 500).send(success ? "OK" : "DB Error");
    }
    catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});
exports.default = placeRoutes;
