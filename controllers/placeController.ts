import { Schema, Types, model } from "mongoose";
import Place from "../models/place";

interface PlaceSchema {
    name: string,
    ownerId: Types.ObjectId,
    photoSrcs: string[],
    reviewIds: Types.ObjectId[],
}

const schema = new Schema<PlaceSchema>({
    name: String,
    ownerId: { type: Schema.Types.ObjectId, ref: "users" },
    photoSrcs: [String],
    reviewIds: { type: [Schema.Types.ObjectId], ref: "reviews" },
});

const DBPlace = model("places", schema);

const createPlaceAsync = async (ownerId: string, name: string) => { 
    await new DBPlace({
        name: name,
        ownerId: Types.ObjectId.createFromHexString(ownerId),
        photoSrcs: [],
        reviewIds: [],
    }).save();
};

const readAllPlaces = async (): Promise<Place[]> => {
    const places = await DBPlace.find({});
    return places.map(place => ({
        id: place._id.toHexString(),
        name: place.name,
        ownerId: place.ownerId.toHexString(),
        photoSrcs: place.photoSrcs,
        reviewIds: place.reviewIds.map(id => id.toHexString())
    }));
};

export {
    createPlaceAsync,
    readAllPlaces
}