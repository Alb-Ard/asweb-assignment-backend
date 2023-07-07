import { Schema, Types, model } from "mongoose";
import Owner from "../models/owner";
import Itinerary, { ItineraryPlace } from "../models/itinerary";

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
    await new DBItinerary({
        name: name,
        owner: Types.ObjectId.createFromHexString(ownerId),
        places: [],
    }).save();
};

const readAllItinerariesAsync = async (ownerId: string, page: number): Promise<Itinerary[]> => {
    const pageSize = 10;
    const itineraries = await DBItinerary.find({ owner: Types.ObjectId.createFromHexString(ownerId) })
        .skip(pageSize * page)
        .limit(pageSize)
        .populate<{ owner: Owner }>("owner", "username")
        .populate<{ places: ItineraryPlace[] }>("places", ["name", "location"]);
    return itineraries.map(itinerary => ({
        id: itinerary._id.toHexString(),
        name: itinerary.name,
        owner: itinerary.owner,
        places: itinerary.places
    }));
};

const readItineraryAsync = async (id: string): Promise<Itinerary | null> => {
    const itinerary = await DBItinerary.findOne({ _id: Types.ObjectId.createFromHexString(id) })
        .populate<{ owner: Owner }>("owner", "username")
        .populate<{ places: ItineraryPlace[] }>("places", ["name", "location"]);
    return !!itinerary ? {
        id: itinerary._id.toHexString(),
        name: itinerary.name,
        owner: itinerary.owner,
        places: itinerary.places
    } : null;
};

const updateItineraryAsync = async (itinerary: Partial<Itinerary> & { id: string }): Promise<boolean> => {
    const { id: itineraryId, ...itineraryData } = itinerary;
    const result = await DBItinerary.updateOne({ _id: Types.ObjectId.createFromHexString(itineraryId) }, itineraryData);
    return result.modifiedCount > 0;
};

export {
    createItineraryAsync,
    readAllItinerariesAsync,
    readItineraryAsync,
    updateItineraryAsync,
}