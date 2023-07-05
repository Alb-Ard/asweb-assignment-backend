import { Schema, Types, model } from "mongoose";
import Place, { PlaceOwner } from "../models/place";

interface PlaceSchema {
    name: string,
    owner: Types.ObjectId,
    location: [number, number],
    photoSrcs: string[],
    reviews: Types.ObjectId[],
}

const schema = new Schema<PlaceSchema>({
    name: String,
    owner: { type: Schema.Types.ObjectId, ref: "users" },
    location: [Number, Number],
    photoSrcs: [String],
    reviews: { type: [Schema.Types.ObjectId], ref: "reviews" },
});

const DBPlace = model("places", schema);

const createPlaceAsync = async (ownerId: string, name: string) => { 
    await new DBPlace({
        name: name,
        owner: Types.ObjectId.createFromHexString(ownerId),
        photoSrcs: [],
        reviews: [],
    }).save();
};

const readAllPlacesAsync = async (): Promise<Place[]> => {
    const places = await DBPlace.find({}).populate<{ owner: PlaceOwner }>("owner");
    return places.map(place => ({
        id: place._id.toHexString(),
        name: place.name,
        owner: place.owner,
        location: place.location,
        photoSrcs: place.photoSrcs,
        reviews: place.reviews.map(id => id.toHexString())
    }));
};

export {
    createPlaceAsync,
    readAllPlacesAsync
}