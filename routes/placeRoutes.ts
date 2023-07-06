import express from "express";
import { createPlaceAsync, readAllPlacesAsync } from "../controllers/placeController";
import { getSessionUserAsync } from "../controllers/sessionController";
import { getSessionToken } from "../lib/auth";

const placeRoutes = express.Router();

placeRoutes.put("/api/place", async (request, response) => { 
    try {
        const sessionUserId = await getSessionUserAsync(getSessionToken(request.headers.cookie));
        const place = request.body as {
            name: string,
            owner: string,
        };
        if (!!!sessionUserId || place.owner !== sessionUserId) {
            response.sendStatus(403);
            return;
        }
        await createPlaceAsync(place.owner, place.name);
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});

placeRoutes.get("/api/place/", async (request, response) => {
    try {
        const places = await readAllPlacesAsync();
        response.send(places);
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});

export default placeRoutes;
