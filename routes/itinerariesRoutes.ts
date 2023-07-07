import express from "express";
import { createPlaceAsync, readAllPlacesAsync } from "../controllers/placeController";
import { getSessionUserAsync } from "../controllers/sessionController";
import { getSessionToken } from "../lib/auth";
import { createItineraryAsync, deleteItineraryAsync, readAllItinerariesAsync, readItineraryAsync, updateItineraryAsync } from "../controllers/itineraryController";
import Itinerary from "../models/itinerary";

const itineraryRoutes = express.Router();

itineraryRoutes.post("/api/itinerary", async (request, response) => { 
    try {
        const sessionUserId = await getSessionUserAsync(getSessionToken(request.headers.cookie));
        const itinerary = request.body as {
            name: string,
            owner: string,
        };
        if (!!!sessionUserId || itinerary.owner !== sessionUserId) {
            response.sendStatus(401);
            return;
        }
        const createdId = await createItineraryAsync(itinerary.owner, itinerary.name);
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

itineraryRoutes.get("/api/itinerary/", async (request, response) => {
    try {
        const sessionUserId = await getSessionUserAsync(getSessionToken(request.headers.cookie));
        if (!!!sessionUserId) {
            response.sendStatus(401);
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

itineraryRoutes.post("/api/itinerary/:id/places", async (request, response) => { 
    try {
        const itineraryId = request.params.id;
        const itinerary = await readItineraryAsync(itineraryId);
        if (!!!itinerary) {
            response.status(404).send("Itinerary not found");
            return;
        }
        const sessionUserId = await getSessionUserAsync(getSessionToken(request.headers.cookie));
        if (!!!sessionUserId || itinerary.owner.id !== sessionUserId) {
            response.sendStatus(401);
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

itineraryRoutes.patch("/api/itinerary/:id", async (request, response) => {
    try {
        const itineraryId = request.params.id;
        const itinerary = await readItineraryAsync(itineraryId);
        if (!!!itinerary) {
            response.status(404).send("Itinerary not found");
            return;
        }
        const sessionUserId = await getSessionUserAsync(getSessionToken(request.headers.cookie));
        if (!!!sessionUserId || itinerary.owner.id !== sessionUserId) {
            response.sendStatus(401);
            return;
        }
        const { id: bodyItineraryId, ...itineraryData } = request.body as Partial<Itinerary>;
        if (!!!itineraryData) {
            response.sendStatus(400);
            return;
        }
        const success = await updateItineraryAsync({ id: itineraryId, ...itineraryData });
        response.sendStatus(success ? 200 : 500);
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});

itineraryRoutes.patch("/api/itinerary/:id/places", async (request, response) => {
    try {
        const itineraryId = request.params.id;
        const itinerary = await readItineraryAsync(itineraryId);
        if (!!!itinerary) {
            response.status(404).send("Itinerary not found");
            return;
        }
        const sessionUserId = await getSessionUserAsync(getSessionToken(request.headers.cookie));
        if (!!!sessionUserId || itinerary.owner.id !== sessionUserId) {
            response.sendStatus(401);
            return;
        }
        const placePairToSwap = request.body.swapPlaces as [string, string];
        if (!!!placePairToSwap) {
            response.sendStatus(400);
            return;
        }
        if (!itinerary.places.some(p => p.id === placePairToSwap[0]) || !itinerary.places.some(p => p.id === placePairToSwap[1])) {
            response.status(400).send(`Place pair ${JSON.stringify(placePairToSwap)} not found in itinerary`);
            return;
        }
        const firstIndex = itinerary.places.findIndex(p => p.id === placePairToSwap[0]);
        const secondIndex = itinerary.places.findIndex(p => p.id === placePairToSwap[1]);
        const firstPlace = { ...itinerary.places[firstIndex] };
        const secondPlace = { ...itinerary.places[secondIndex] };
        const newPlaces = [...itinerary.places];
        newPlaces[firstIndex] = secondPlace;
        newPlaces[secondIndex] = firstPlace;
        const success = await updateItineraryAsync({ id: itineraryId, places: newPlaces });
        response.sendStatus(success ? 200 : 500);
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});

itineraryRoutes.delete("/api/itinerary/:itineraryId/places/:placeId", async (request, response) => {
    try {
        const itineraryId = request.params.itineraryId;
        const itinerary = await readItineraryAsync(itineraryId);
        if (!!!itinerary) {
            response.status(404).send("Itinerary not found");
            return;
        }
        const sessionUserId = await getSessionUserAsync(getSessionToken(request.headers.cookie));
        if (!!!sessionUserId || itinerary.owner.id !== sessionUserId) {
            response.sendStatus(401);
            return;
        }
        const placeId = request.params.placeId;
        if (!itinerary.places.some(p => p.id === placeId)) {
            response.status(404).send("Place not found in itinerary");
            return;
        }
        const success = await updateItineraryAsync({ id: itineraryId, places: [...itinerary.places.filter(i => i.id !== placeId)] });
        response.sendStatus(success ? 200 : 500);
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});

itineraryRoutes.delete("/api/itinerary/:id", async (request, response) => {
    try {
        const itineraryId = request.params.id;
        const itinerary = await readItineraryAsync(itineraryId);
        if (!!!itinerary) {
            response.sendStatus(404);
            return;
        }
        const sessionUserId = await getSessionUserAsync(getSessionToken(request.headers.cookie));
        if (!!!sessionUserId || itinerary.owner.id !== sessionUserId) {
            response.sendStatus(401);
            return;
        }
        const success = await deleteItineraryAsync(itineraryId);
        response.sendStatus(success ? 200 : 500);
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});

export default itineraryRoutes;
