"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteItineraryAsync = exports.updateItineraryAsync = exports.readItineraryAsync = exports.readUserItinerariesAsync = exports.createItineraryAsync = void 0;
const mongoose_1 = require("mongoose");
const db_1 = require("../lib/db");
const itinerarySchema = new mongoose_1.Schema({
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: "users" },
    name: String,
    places: { type: [mongoose_1.Schema.Types.ObjectId], ref: "places" },
});
const DBItinerary = (0, mongoose_1.model)("itineraries", itinerarySchema);
const createItineraryAsync = async (ownerId, name) => {
    return (await new DBItinerary({
        name: name,
        owner: mongoose_1.Types.ObjectId.createFromHexString(ownerId),
        places: [],
    }).save())?._id?.toHexString();
};
exports.createItineraryAsync = createItineraryAsync;
const readUserItinerariesAsync = async (ownerId, page) => {
    const pageSize = 10;
    const itineraries = await DBItinerary.find({ owner: mongoose_1.Types.ObjectId.createFromHexString(ownerId) })
        .skip(pageSize * page)
        .limit(pageSize)
        .populate("owner", "username")
        .populate("places", ["name", "location"]);
    return itineraries.map(itinerary => ({
        _id: itinerary._id.toHexString(),
        name: itinerary.name,
        owner: (0, db_1.mapOwner)(itinerary.owner),
        places: itinerary.places.map(place => ({ _id: place._id.toHexString(), name: place.name, location: place.location })),
    }));
};
exports.readUserItinerariesAsync = readUserItinerariesAsync;
const readItineraryAsync = async (id) => {
    const itinerary = await DBItinerary.findOne({ _id: mongoose_1.Types.ObjectId.createFromHexString(id) })
        .populate("owner", "username")
        .populate("places", ["name", "location"]);
    return !!itinerary ? {
        _id: itinerary._id.toHexString(),
        name: itinerary.name,
        owner: (0, db_1.mapOwner)(itinerary.owner),
        places: itinerary.places.map(place => ({ _id: place._id.toHexString(), name: place.name, location: place.location })),
    } : null;
};
exports.readItineraryAsync = readItineraryAsync;
const updateItineraryAsync = async (id, data) => {
    const result = await DBItinerary.updateOne({ _id: mongoose_1.Types.ObjectId.createFromHexString(id) }, data);
    return result.modifiedCount > 0;
};
exports.updateItineraryAsync = updateItineraryAsync;
const deleteItineraryAsync = async (id) => {
    const result = await DBItinerary.deleteOne({ _id: mongoose_1.Types.ObjectId.createFromHexString(id) });
    return result.deletedCount > 0;
};
exports.deleteItineraryAsync = deleteItineraryAsync;
