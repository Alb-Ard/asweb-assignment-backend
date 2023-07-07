import { Schema, Types, model } from "mongoose";
import Place from "../models/place";
import Owner from "../models/owner";

interface PlaceSchema {
    name: string,
    description: string,
    owner: Types.ObjectId,
    location: [number, number],
    photoSrcs: string[],
    reviews: Types.ObjectId[],
}

const placeSchema = new Schema<PlaceSchema>({
    name: String,
    description: String,
    owner: { type: Schema.Types.ObjectId, ref: "users" },
    location: [Number, Number],
    photoSrcs: [String],
    reviews: { type: [Schema.Types.ObjectId], ref: "reviews" },
});

const DBPlace = model("places", placeSchema);

const createPlaceAsync = async (ownerId: string, name: string, location: [number, number]) => { 
    return (await new DBPlace({
        name: name,
        description: "",
        location: location,
        owner: Types.ObjectId.createFromHexString(ownerId),
        photoSrcs: [],
        reviews: [],
    }).save())?._id?.toHexString();
};

const readAllPlacesAsync = async (page: number): Promise<Place[]> => {
    const pageSize = 10;
    const places = await DBPlace.find({})
        .skip(pageSize * page)
        .limit(pageSize)
        .populate<{ owner: Owner }>("owner", "username");
    return places.map(place => ({
        id: place._id.toHexString(),
        name: place.name,
        description: place.description,
        owner: place.owner,
        location: place.location,
        photoSrcs: place.photoSrcs,
        reviews: place.reviews.map(id => id.toHexString())
    }));
};

const readPlaceAsync = async (id: string): Promise<Place | null> => {
    const place = await DBPlace.findOne({ _id: Types.ObjectId.createFromHexString(id) })
        .populate<{ owner: Owner }>("owner", "username");
    return !!place ? {
        id: place._id.toHexString(),
        name: place.name,
        description: place.description,
        owner: place.owner,
        location: place.location,
        photoSrcs: place.photoSrcs,
        reviews: place.reviews.map(id => id.toHexString())
    } : null;
};

const updatePlaceAsync = async (place: Partial<Place> & { id: string }): Promise<boolean> => {
    const { id: placeId, ...placeData } = place;
    const result = await DBPlace.updateOne({ _id: Types.ObjectId.createFromHexString(placeId) }, placeData);
    return result.modifiedCount > 0;
};

const deletePlaceAsync = async (id: string): Promise<boolean> => {
    const result = await DBPlace.deleteOne({ _id: Types.ObjectId.createFromHexString(id) });
    return result.deletedCount > 0;
};

export {
    createPlaceAsync,
    readAllPlacesAsync,
    readPlaceAsync,
    updatePlaceAsync,
    deletePlaceAsync
}