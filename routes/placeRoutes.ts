import express from "express";
import { createPlaceAsync, deletePlaceAsync, readAllPlacesAsync, readPlaceAsync, updatePlaceAsync } from "../controllers/placeController";
import { getSessionUserAsync } from "../controllers/sessionController";
import { checkOwnershipAsync, getSessionToken } from "../lib/auth";
import Place from "../models/place";
import { createReviewAsync, deleteReviewAsync, readPlaceReviewsAsync, readReviewAsync, updateReviewAsync } from "../controllers/reviewController";
import { notifyChangedReviewAsync, notifyNewReviewAsync } from "../lib/notify";

const placeRoutes = express.Router();

placeRoutes.post("/api/place", async (request, response) => { 
    try {
        const sessionUserId = await getSessionUserAsync(getSessionToken(request.headers.cookie));
        const place = request.body as {
            name: string,
            owner: string,
            location: [number, number],
        };
        if (!!!sessionUserId || place.owner !== sessionUserId) {
            response.sendStatus(401);
            return;
        }
        const createdId = await createPlaceAsync(place.owner, place.name, place.location);
        if (!!!createdId) {
            response.sendStatus(500);
            return;
        }
        response.send(createdId);
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});

placeRoutes.post("/api/place/:id/review", async (request, response) => {
    try {
        const placeId = request.params.id;
        const place = await readPlaceAsync(placeId);
        if (!place) {
            response.sendStatus(404);
            return;
        }
        const sessionUserId = await getSessionUserAsync(getSessionToken(request.headers.cookie));
        if (!!!sessionUserId) {
            response.sendStatus(401);
            return;
        }
        const reviewData = request.body as {
            star: number
        };
        const existingReview = await readReviewAsync(placeId, sessionUserId);
        if (existingReview) {
            const success = await updateReviewAsync(existingReview._id, reviewData);
            response.status(success ? 200 : 500).send(success ? existingReview._id : "DB Error");
            notifyChangedReviewAsync(placeId, sessionUserId);
            return;
        }
        const createdId = await createReviewAsync(reviewData.star, request.params.id, sessionUserId);
        if (!!!createdId) {
            response.sendStatus(500);
            return;
        }
        response.send(createdId);
        notifyNewReviewAsync(placeId, sessionUserId);
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});

placeRoutes.get("/api/place/", async (request, response) => {
    try {
        const places = await Promise.all((await readAllPlacesAsync(Number(request.query.page ?? "0")))
            .map(async place => ({
                ...place,
                reviews: await readPlaceReviewsAsync(place._id),
            })));
        response.send(places);
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});

placeRoutes.get("/api/place/:id", async (request, response) => {
    try {
        const place = await readPlaceAsync(request.params.id);
        if (!!!place) {
            response.sendStatus(404);
            return;
        }
        response.send({
            ...place,
            reviews: await readPlaceReviewsAsync(place._id),
        });
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});

placeRoutes.get("/api/place/:placeId/review/:reviewId", async (request, response) => {
    try {
        const place = await readPlaceAsync(request.params.placeId);
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
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});

placeRoutes.patch("/api/place/:id", async (request, response) => {
    try {
        const place = request.body as Partial<Place>;
        if (!!!place) {
            response.sendStatus(400);
            return;
        }
        const { _id: placeId, ...placeData } = place;
        if (!!placeId && placeId !== request.params.id) {
            response.sendStatus(400);
            return;
        }
        const existingPlace = await readPlaceAsync(request.params.id);
        if (!!!existingPlace) {
            response.sendStatus(404);
            return;
        }
        if (!(await checkOwnershipAsync(existingPlace.owner._id, request.headers.cookie))) {
            response.sendStatus(401);
            return;
        }
        const success = await updatePlaceAsync(request.params.id, placeData);
        response.status(success ? 200 : 500).send(success ? "OK" : "DB Error");
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});

placeRoutes.delete("/api/place/:id", async (request, response) => {
    try {
        const placeId = request.params.id;
        const place = await readPlaceAsync(placeId);
        if (!!!place) {
            response.sendStatus(404);
            return;
        }
        if (!(await checkOwnershipAsync(place.owner._id, request.headers.cookie))) {
            response.sendStatus(401);
            return;
        }
        const success = await deletePlaceAsync(placeId);
        if (success) {
            for (const review of place.reviews) {
                await deleteReviewAsync(review._id);
            }
        }
        response.status(success ? 200 : 500).send(success ? "OK" : "DB Error");
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});

placeRoutes.delete("/api/place/:placeId/review/", async (request, response) => {
    try {
        const place = await readPlaceAsync(request.params.placeId);
        if (!!!place) {
            response.status(404).send("Place not found");
            return;
        }
        const currentUserId = await getSessionUserAsync(getSessionToken(request.headers.cookie));
        if (!!!currentUserId) {
            response.sendStatus(401);
            return;
        }
        const review = await readReviewAsync(place._id, currentUserId);
        if (!!!review) {
            response.status(404).send("Review not found for user in place");
            return;
        }
        const success = await deleteReviewAsync(review._id);
        response.status(success ? 200 : 500).send(success ? "OK" : "DB Error");
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});


placeRoutes.delete("/api/place/:placeId/review/:reviewId", async (request, response) => {
    try {
        const place = await readPlaceAsync(request.params.placeId);
        if (!!!place) {
            response.status(404).send("Place not found");
            return;
        }
        const currentUserId = await getSessionUserAsync(getSessionToken(request.headers.cookie));
        if (!!!currentUserId) {
            response.sendStatus(401);
            return;
        }
        const review = await readReviewAsync(place._id, currentUserId);
        if (!!!review || review._id != request.params.reviewId) {
            response.status(404).send("Review not found in place");
            return;
        }
        if (review.user._id != currentUserId) {
            response.sendStatus(401);
            return;
        }
        const success = await deleteReviewAsync(review._id);
        response.status(success ? 200 : 500).send(success ? "OK" : "DB Error");
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});

export default placeRoutes;
