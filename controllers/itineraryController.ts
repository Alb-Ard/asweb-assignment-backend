import { Schema, Types, model } from "mongoose";
import Owner from "../models/owner";
import Itinerary, { ItineraryPlace } from "../models/itinerary";
import { UpdateFields } from "../lib/db";

interface ItinerarySchema {
    owner: Types.ObjectId,
    name: string,
    places: Types.ObjectId[]
}

const itinerarySchema = new Schema<ItinerarySchema>({
    owner: { type: Schema.Types.ObjectId, ref: "users" },
    name: String,
    places: { type: [Schema.Types.ObjectId], ref: "places" },
});

const DBItinerary = model("itineraries", itinerarySchema);

const createItineraryAsync = async (ownerId: string, name: string) => { 
    return (await new DBItinerary({
        name: name,
        owner: Types.ObjectId.createFromHexString(ownerId),
        places: [],
    }).save())?._id?.toHexString();
};

const readAllItinerariesAsync = async (ownerId: string, page: number): Promise<Itinerary[]> => {
    const pageSize = 10;
    const itineraries = await DBItinerary.find({ owner: Types.ObjectId.createFromHexString(ownerId) })
        .skip(pageSize * page)
        .limit(pageSize)
        .populate<{ owner: Owner }>([{ path: "owner", select: "username" }])
        .populate<{ places: ItineraryPlace[] }>([{ path: "places", select: ["name", "location"] }])
    return itineraries.map(itinerary => ({
        _id: itinerary._id.toHexString(),
        name: itinerary.name,
        owner: itinerary.owner,
        places: itinerary.places,
    }));
};

const readItineraryAsync = async (id: string): Promise<Itinerary | null> => {
    const itinerary = await DBItinerary.findOne({ _id: Types.ObjectId.createFromHexString(id) })
        .populate<{ owner: Owner }>([{ path: "owner", select: "username" }])
        .populate<{ places: ItineraryPlace[] }>([{ path: "places", select: ["name", "location"] }])
    return !!itinerary ? {
        _id: itinerary._id.toHexString(),
        name: itinerary.name,
        owner: itinerary.owner,
        places: itinerary.places
    } : null;
};

const updateItineraryAsync = async (id: string, data: UpdateFields<Itinerary>): Promise<boolean> => {
    const result = await DBItinerary.updateOne({ _id: Types.ObjectId.createFromHexString(id) }, data);
    return result.modifiedCount > 0;
};

const deleteItineraryAsync = async (id: string): Promise<boolean> => {
    const result = await DBItinerary.deleteOne({ _id: Types.ObjectId.createFromHexString(id) });
    return result.deletedCount > 0;
};

export {
    createItineraryAsync,
    readAllItinerariesAsync,
    readItineraryAsync,
    updateItineraryAsync,
    deleteItineraryAsync,
}