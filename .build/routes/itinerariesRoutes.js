"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sessionController_1 = require("../controllers/sessionController");
const auth_1 = require("../lib/auth");
const itineraryController_1 = require("../controllers/itineraryController");
const notify_1 = require("../lib/notify");
const itineraryRoutes = express_1.default.Router();
itineraryRoutes.post("/api/itinerary", async (request, response) => {
    try {
        const itinerary = request.body;
        if (!(await (0, auth_1.checkOwnershipAsync)(itinerary.owner, request.headers.cookie))) {
            response.sendStatus(401);
            return;
        }
        const createdId = await (0, itineraryController_1.createItineraryAsync)(itinerary.owner, itinerary.name);
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
itineraryRoutes.get("/api/itinerary", async (request, response) => {
    try {
        const sessionUserId = await (0, sessionController_1.getSessionUserAsync)((0, auth_1.getSessionToken)(request.headers.cookie));
        if (!!!sessionUserId) {
            response.sendStatus(401);
            return;
        }
        const itineraries = await (0, itineraryController_1.readUserItinerariesAsync)(sessionUserId, Number(request.query.page ?? "0"));
        response.send(itineraries);
    }
    catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});
itineraryRoutes.get("/api/itinerary/:id", async (request, response) => {
    try {
        const itineraryId = request.params.id;
        const itinerary = await (0, itineraryController_1.readItineraryAsync)(itineraryId);
        if (!!!itinerary) {
            response.sendStatus(404);
            return;
        }
        if (!(await (0, auth_1.checkOwnershipAsync)(itinerary.owner._id, request.headers.cookie))) {
            response.sendStatus(401);
            return;
        }
        response.send(itinerary);
    }
    catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});
itineraryRoutes.post("/api/itinerary/:id/places", async (request, response) => {
    try {
        const itineraryId = request.params.id;
        const itinerary = await (0, itineraryController_1.readItineraryAsync)(itineraryId);
        if (!!!itinerary) {
            response.status(404).send("Itinerary not found");
            return;
        }
        if (!(await (0, auth_1.checkOwnershipAsync)(itinerary.owner._id, request.headers.cookie))) {
            response.sendStatus(401);
            return;
        }
        const placeId = request.body.id;
        if (itinerary.places.some(p => p._id == placeId)) {
            response.status(400).send("Place already in itinerary");
            return;
        }
        const success = await (0, itineraryController_1.updateItineraryAsync)(itineraryId, { places: [...itinerary.places, placeId] });
        response.status(success ? 200 : 500).send(success ? "OK" : "DB Error");
        (0, notify_1.notifyPlaceInItineraryAsync)(placeId);
    }
    catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});
itineraryRoutes.patch("/api/itinerary/:id", async (request, response) => {
    try {
        const itineraryId = request.params.id;
        const itinerary = await (0, itineraryController_1.readItineraryAsync)(itineraryId);
        if (!!!itinerary) {
            response.status(404).send("Itinerary not found");
            return;
        }
        if (!(await (0, auth_1.checkOwnershipAsync)(itinerary.owner._id, request.headers.cookie))) {
            response.sendStatus(401);
            return;
        }
        const { _id: bodyItineraryId, ...itineraryData } = request.body;
        if (!!!itineraryData || (!!bodyItineraryId && bodyItineraryId !== itineraryId)) {
            response.sendStatus(400);
            return;
        }
        const success = await (0, itineraryController_1.updateItineraryAsync)(itineraryId, itineraryData);
        response.status(success ? 200 : 500).send(success ? "OK" : "DB Error");
    }
    catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});
itineraryRoutes.patch("/api/itinerary/:id/places", async (request, response) => {
    try {
        const itineraryId = request.params.id;
        const itinerary = await (0, itineraryController_1.readItineraryAsync)(itineraryId);
        if (!!!itinerary) {
            response.status(404).send("Itinerary not found");
            return;
        }
        if (!(await (0, auth_1.checkOwnershipAsync)(itinerary.owner._id, request.headers.cookie))) {
            response.sendStatus(401);
            return;
        }
        const placePairToSwap = request.body.swapPlaces;
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
        const success = await (0, itineraryController_1.updateItineraryAsync)(itineraryId, { places: newPlaces });
        response.status(success ? 200 : 500).send(success ? "OK" : "DB Error");
    }
    catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});
itineraryRoutes.delete("/api/itinerary/:itineraryId/places/:placeId", async (request, response) => {
    try {
        const itineraryId = request.params.itineraryId;
        const itinerary = await (0, itineraryController_1.readItineraryAsync)(itineraryId);
        if (!!!itinerary) {
            response.status(404).send("Itinerary not found");
            return;
        }
        if (!(await (0, auth_1.checkOwnershipAsync)(itinerary.owner._id, request.headers.cookie))) {
            response.sendStatus(401);
            return;
        }
        const placeId = request.params.placeId;
        if (!itinerary.places.some(p => p._id == placeId)) {
            response.status(404).send("Place not found in itinerary");
            return;
        }
        const success = await (0, itineraryController_1.updateItineraryAsync)(itineraryId, { places: [...itinerary.places.filter(i => i._id != placeId)] });
        response.status(success ? 200 : 500).send(success ? "OK" : "DB Error");
    }
    catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});
itineraryRoutes.delete("/api/itinerary/:id", async (request, response) => {
    try {
        const itineraryId = request.params.id;
        const itinerary = await (0, itineraryController_1.readItineraryAsync)(itineraryId);
        if (!!!itinerary) {
            response.sendStatus(404);
            return;
        }
        if (!(await (0, auth_1.checkOwnershipAsync)(itinerary.owner._id, request.headers.cookie))) {
            response.sendStatus(401);
            return;
        }
        const success = await (0, itineraryController_1.deleteItineraryAsync)(itineraryId);
        response.status(success ? 200 : 500).send(success ? "OK" : "DB Error");
    }
    catch (err) {
        console.error(err);
        response.status(500).send(err);
    }
});
exports.default = itineraryRoutes;
