"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlaceAsync = exports.updatePlaceAsync = exports.readPlaceAsync = exports.readAllPlacesAsync = exports.readUserPlacesAsync = exports.createPlaceAsync = void 0;
const mongoose_1 = require("mongoose");
const db_1 = require("../lib/db");
const placeSchema = new mongoose_1.Schema({
    name: String,
    description: String,
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: "users" },
    location: [Number, Number],
    photoSrcs: [String]
});
const DBPlace = (0, mongoose_1.model)("places", placeSchema);
const createPlaceAsync = async (ownerId, name, location) => {
    return (await new DBPlace({
        name: name,
        description: "",
        location: location,
        owner: mongoose_1.Types.ObjectId.createFromHexString(ownerId),
        photoSrcs: []
    }).save())?._id?.toHexString();
};
exports.createPlaceAsync = createPlaceAsync;
const readAllPlacesAsync = async (page) => {
    const pageSize = 10;
    const places = await DBPlace.find({})
        .skip(pageSize * page)
        .limit(pageSize)
        .populate("owner", "username");
    return places.map(place => ({
        _id: place._id.toHexString(),
        name: place.name,
        description: place.description,
        owner: (0, db_1.mapOwner)(place.owner),
        location: place.location,
        photoSrcs: place.photoSrcs,
        reviews: [],
    }));
};
exports.readAllPlacesAsync = readAllPlacesAsync;
const readUserPlacesAsync = async (ownerId, page) => {
    const pageSize = 10;
    const places = await DBPlace.find({ owner: mongoose_1.Types.ObjectId.createFromHexString(ownerId) })
        .skip(pageSize * page)
        .limit(pageSize)
        .populate("owner", "username");
    return places.map(place => ({
        _id: place._id.toHexString(),
        name: place.name,
        description: place.description,
        owner: (0, db_1.mapOwner)(place.owner),
        location: place.location,
        photoSrcs: place.photoSrcs,
        reviews: [],
    }));
};
exports.readUserPlacesAsync = readUserPlacesAsync;
const readPlaceAsync = async (id) => {
    const place = await DBPlace.findOne({ _id: mongoose_1.Types.ObjectId.createFromHexString(id) })
        .populate("owner", "username");
    return !!place ? {
        _id: place._id.toHexString(),
        name: place.name,
        description: place.description,
        owner: (0, db_1.mapOwner)(place.owner),
        location: place.location,
        photoSrcs: place.photoSrcs,
        reviews: [],
    } : null;
};
exports.readPlaceAsync = readPlaceAsync;
const updatePlaceAsync = async (id, data) => {
    const result = await DBPlace.updateOne({ _id: mongoose_1.Types.ObjectId.createFromHexString(id) }, data);
    return result.modifiedCount > 0;
};
exports.updatePlaceAsync = updatePlaceAsync;
const deletePlaceAsync = async (id) => {
    const result = await DBPlace.deleteOne({ _id: mongoose_1.Types.ObjectId.createFromHexString(id) });
    return result.deletedCount > 0;
};
exports.deletePlaceAsync = deletePlaceAsync;
