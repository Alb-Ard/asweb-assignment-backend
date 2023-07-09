import { Schema, Types, model } from "mongoose";
import Place from "../models/place";
import Owner from "../models/owner";
import { UpdateFields, WithObjectId, withStringId } from "../lib/db";
import Review from "../models/review";

interface PlaceSchema {
    name: string,
    description: string,
    owner: Types.ObjectId,
    location: [number, number],
    photoSrcs: string[]
}

const placeSchema = new Schema<PlaceSchema>({
    name: String,
    description: String,
    owner: { type: Schema.Types.ObjectId, ref: "users" },
    location: [Number, Number],
    photoSrcs: [String]
});

const DBPlace = model("places", placeSchema);

const createPlaceAsync = async (ownerId: string, name: string, location: [number, number]) => { 
    return (await new DBPlace({
        name: name,
        description: "",
        location: location,
        owner: Types.ObjectId.createFromHexString(ownerId),
        photoSrcs: []
    }).save())?._id?.toHexString();
};

const readAllPlacesAsync = async (page: number): Promise<Place[]> => {
    const pageSize = 10;
    const places = await DBPlace.find({})
        .skip(pageSize * page)
        .limit(pageSize)
        .populate<{ owner: WithObjectId<Owner> }>("owner", "username");
    return places.map(place => ({
        _id: place._id.toHexString(),
        name: place.name,
        description: place.description,
        owner: withStringId(place.owner),
        location: place.location,
        photoSrcs: place.photoSrcs,
        reviews: [],
    }));
};

const readUserPlacesAsync = async (ownerId: string, page: number): Promise<Place[]> => {
    const pageSize = 10;
    const places = await DBPlace.find({ owner: Types.ObjectId.createFromHexString(ownerId) })
        .skip(pageSize * page)
        .limit(pageSize)
        .populate<{ owner: WithObjectId<Owner> }>("owner", "username");
    return places.map(place => ({
        _id: place._id.toHexString(),
        name: place.name,
        description: place.description,
        owner: withStringId(place.owner),
        location: place.location,
        photoSrcs: place.photoSrcs,
        reviews: [],
    }));
};

const readPlaceAsync = async (id: string): Promise<Place | null> => {
    const place = await DBPlace.findOne({ _id: Types.ObjectId.createFromHexString(id) })
        .populate<{ owner: WithObjectId<Owner> }>("owner", "username");
    return !!place ? {
        _id: place._id.toHexString(),
        name: place.name,
        description: place.description,
        owner: withStringId(place.owner),
        location: place.location,
        photoSrcs: place.photoSrcs,
        reviews: [],
    } : null;
};

const updatePlaceAsync = async (id: string, data: UpdateFields<Place>): Promise<boolean> => {
    const result = await DBPlace.updateOne({ _id: Types.ObjectId.createFromHexString(id) }, data);
    return result.modifiedCount > 0;
};

const deletePlaceAsync = async (id: string): Promise<boolean> => {
    const result = await DBPlace.deleteOne({ _id: Types.ObjectId.createFromHexString(id) });
    return result.deletedCount > 0;
};

export {
    createPlaceAsync,
    readUserPlacesAsync,
    readAllPlacesAsync,
    readPlaceAsync,
    updatePlaceAsync,
    deletePlaceAsync
}