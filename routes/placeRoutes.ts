import express from "express";
import { createPlaceAsync, deletePlaceAsync, readAllPlacesAsync, readPlaceAsync, updatePlaceAsync } from "../controllers/placeController";
import { getSessionUserAsync } from "../controllers/sessionController";
import { getSessionToken } from "../lib/auth";
import Place from "../models/place";

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

placeRoutes.get("/api/place/", async (request, response) => {
    try {
        const places = await readAllPlacesAsync(Number(request.query.page ?? "0"));
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
        response.send(place);
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});

placeRoutes.patch("/api/place/:id", async (request, response) => {
    try {
        const place = request.body as Partial<Place> & { id: string };
        if (!!!place) {
            response.sendStatus(400);
            return;
        }
        if (place.id !== request.params.id) {
            response.sendStatus(400);
            return;
        }
        if (!!!await readPlaceAsync(place.id)) {
            response.sendStatus(404);
            return;
        }
        const success = await updatePlaceAsync(place);
        response.sendStatus(success ? 200 : 500);
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});

placeRoutes.delete("/api/place/:id", async (request, response) => {
    try {
        const placeId = request.params.id;
        if (!!!await readPlaceAsync(placeId)) {
            response.sendStatus(404);
            return;
        }
        const success = await deletePlaceAsync(placeId);
        response.sendStatus(success ? 200 : 500);
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});

export default placeRoutes;
