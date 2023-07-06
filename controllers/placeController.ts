import { Schema, Types, model } from "mongoose";
import Place, { PlaceOwner } from "../models/place";

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

const createPlaceAsync = async (ownerId: string, name: string) => { 
    await new DBPlace({
        name: name,
        description: "",
        owner: Types.ObjectId.createFromHexString(ownerId),
        photoSrcs: [],
        reviews: [],
    }).save();
};

const readAllPlacesAsync = async (page: number): Promise<Place[]> => {
    const pageSize = 10;
    const places = await DBPlace.find({})
        .skip(pageSize * page)
        .limit(pageSize)
        .populate<{ owner: PlaceOwner }>("owner", "username");
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

export {
    createPlaceAsync,
    readAllPlacesAsync
}