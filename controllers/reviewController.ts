import {model, Schema, Types} from "mongoose";
import Review  from "../models/review";
import {UpdateFields} from "../lib/db";


interface ReviewSchema {
    star: number,
    place: Types.ObjectId,
    user: Types.ObjectId
}

const reviewSchema = new Schema<ReviewSchema>({
    star: Number,
    place: { type: Schema.Types.ObjectId, ref: "places" },
    user: { type: Schema.Types.ObjectId, ref: "users" },
});

const DBPlace = model("reviews", reviewSchema);

const createReview = async (star: number, placeId: string, userId: string) => {
    return (await new DBPlace({
        star: star,
        place: placeId,
        user: userId
    }).save())?._id?.toHexString();
};

const updateReview = async (id: string, newData: UpdateFields<Review>): Promise<boolean> => {
    const result = await DBPlace.updateOne({ _id: Types.ObjectId.createFromHexString(id) }, newData);
    return result.modifiedCount > 0;
};

const removeReview = async (id: string): Promise<boolean> => {
    const result = await DBPlace.deleteOne({_id: Types.ObjectId.createFromHexString(id)});
    return result.deletedCount > 0;
};