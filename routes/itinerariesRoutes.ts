import express from "express";
import { getSessionUserAsync } from "../controllers/sessionController";
import { checkOwnershipAsync, getSessionToken } from "../lib/auth";
import { createItineraryAsync, deleteItineraryAsync, readUserItinerariesAsync, readItineraryAsync, updateItineraryAsync } from "../controllers/itineraryController";
import Itinerary from "../models/itinerary";
import { notifyPlaceInItineraryAsync } from "../lib/notify";

const itineraryRoutes = express.Router();

itineraryRoutes.post("/api/itinerary", async (request, response) => { 
    try {
        const itinerary = request.body as {
            name: string,
            owner: string,
        };
        if (!(await checkOwnershipAsync(itinerary.owner, request.headers.cookie))) {
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

itineraryRoutes.get("/api/itinerary", async (request, response) => {
    try {
        const sessionUserId = await getSessionUserAsync(getSessionToken(request.headers.cookie));
        if (!!!sessionUserId) {
            response.sendStatus(401);
            return;
        }
        const itineraries = await readUserItinerariesAsync(sessionUserId, Number(request.query.page ?? "0"));
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
            return;
        }
        if (!(await checkOwnershipAsync(itinerary.owner._id, request.headers.cookie))) {
            response.sendStatus(401);
            return;
        }
        response.send(itinerary);
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
        if (!(await checkOwnershipAsync(itinerary.owner._id, request.headers.cookie))) {
            response.sendStatus(401);
            return;
        }
        const placeId = request.body.id as string;
        if (itinerary.places.some(p => p._id == placeId)) {
            response.status(400).send("Place already in itinerary");
            return;
        }
        const success = await updateItineraryAsync(itineraryId, { places: [...itinerary.places, placeId] });
        response.status(success ? 200 : 500).send(success ? "OK" : "DB Error");
        notifyPlaceInItineraryAsync(placeId);
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
        if (!(await checkOwnershipAsync(itinerary.owner._id, request.headers.cookie))) {
            response.sendStatus(401);
            return;
        }
        const { _id: bodyItineraryId, ...itineraryData } = request.body as Partial<Itinerary>;
        if (!!!itineraryData || (!!bodyItineraryId && bodyItineraryId !== itineraryId)) {
            response.sendStatus(400);
            return;
        }
        const success = await updateItineraryAsync(itineraryId, itineraryData);
        response.status(success ? 200 : 500).send(success ? "OK" : "DB Error");
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
        if (!(await checkOwnershipAsync(itinerary.owner._id, request.headers.cookie))) {
            response.sendStatus(401);
            return;
        }
        const placePairToSwap = request.body.swapPlaces as [string, string];
        if (!!!placePairToSwap) {
            response.sendStatus(400);
            return;
        }
        const firstIndex = itinerary.places.findIndex(p => p._id == placePairToSwap[0]);
        const secondIndex = itinerary.places.findIndex(p => p._id == placePairToSwap[1]);
        if (firstIndex < 0 || secondIndex < 0) {
            response.status(404).send(`Place pair ${JSON.stringify(placePairToSwap)} not found in itinerary`);
            return;
        }
        const firstPlace = { ...itinerary.places[firstIndex] };
        const secondPlace = { ...itinerary.places[secondIndex] };
        const newPlaces = [...itinerary.places];
        newPlaces[firstIndex] = secondPlace;
        newPlaces[secondIndex] = firstPlace;
        const success = await updateItineraryAsync(itineraryId, { places: newPlaces });
        response.status(success ? 200 : 500).send(success ? "OK" : "DB Error");
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
        if (!(await checkOwnershipAsync(itinerary.owner._id, request.headers.cookie))) {
            response.sendStatus(401);
            return;
        }
        const placeId = request.params.placeId;
        if (!itinerary.places.some(p => p._id == placeId)) {
            response.status(404).send("Place not found in itinerary");
            return;
        }
        const success = await updateItineraryAsync(itineraryId, { places: [...itinerary.places.filter(i => i._id != placeId)] });
        response.status(success ? 200 : 500).send(success ? "OK" : "DB Error");
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
        if (!(await checkOwnershipAsync(itinerary.owner._id, request.headers.cookie))) {
            response.sendStatus(401);
            return;
        }
        const success = await deleteItineraryAsync(itineraryId);
        response.status(success ? 200 : 500).send(success ? "OK" : "DB Error");
    } catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});

export default itineraryRoutes;
