import express from "express";
import { createPlaceAsync, readAllPlacesAsync } from "../controllers/placeController";
import { getSessionUserAsync } from "../controllers/sessionController";
import { getSessionToken } from "../lib/auth";
import { createItineraryAsync, readAllItinerariesAsync, readItineraryAsync, updateItineraryAsync } from "../controllers/itineraryController";

const itineraryRoutes = express.Router();

itineraryRoutes.put("/api/itinerary", async (request, response) => { 
    try {
        const sessionUserId = await getSessionUserAsync(getSessionToken(request.headers.cookie));
        const itinerary = request.body as {
            name: string,
            owner: string,
        };
        if (!!!sessionUserId || itinerary.owner !== sessionUserId) {
            response.sendStatus(403);
            return;
        }
        await createItineraryAsync(itinerary.owner, itinerary.name);
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});

itineraryRoutes.get("/api/itinerary/", async (request, response) => {
    try {
        const sessionUserId = await getSessionUserAsync(getSessionToken(request.headers.cookie));
        if (!!!sessionUserId) {
            response.sendStatus(403);
            return;
        }
        const itineraries = await readAllItinerariesAsync(sessionUserId, Number(request.query.page ?? "0"));
        response.send(itineraries);
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});

itineraryRoutes.get("/api/itinerary/:id", async (request, response) => {
    try {
        const itineraryId = request.params.id;
        const itinerary = await readItineraryAsync(itineraryId);
        if (!!!itinerary) {
            response.sendStatus(404);
        } else {
            response.send(itinerary);
        }
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});

itineraryRoutes.put("/api/itinerary/:id/places", async (request, response) => { 
    try {
        const itineraryId = request.params.id;
        const itinerary = await readItineraryAsync(itineraryId);
        if (!!!itinerary) {
            response.status(404).send("Itinerary not found");
            return;
        }
        const sessionUserId = await getSessionUserAsync(getSessionToken(request.headers.cookie));
        if (!!!sessionUserId || itinerary.owner.id !== sessionUserId) {
            response.sendStatus(403);
            return;
        }
        const placeId = request.body.id;
        if (itinerary.places.some(p => p.id === placeId)) {
            response.status(400).send("Place already in itinerary");
            return;
        }
        const success = await updateItineraryAsync({ id: itineraryId, places: [...itinerary.places, placeId] });
        response.sendStatus(success ? 200 : 500);
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});

export default itineraryRoutes;
