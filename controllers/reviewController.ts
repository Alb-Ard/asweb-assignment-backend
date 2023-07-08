import {model, Schema, Types} from "mongoose";
import Review  from "../models/review";
import {UpdateFields} from "../lib/db";
import Owner from "../models/owner";

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

const DBReview = model("reviews", reviewSchema);

const createReviewAsync = async (star: number, placeId: string, userId: string) => {
    return (await new DBReview({
        star: star,
        place: Types.ObjectId.createFromHexString(placeId),
        user: Types.ObjectId.createFromHexString(userId),
    }).save())?._id?.toHexString();
};

const readReviewAsync = async (placeId: string, userId: string): Promise<Review | null> => {
    const review = await DBReview.findOne({ place: Types.ObjectId.createFromHexString(placeId), user: Types.ObjectId.createFromHexString(userId) })
        .populate<{ user: Owner }>("user", ["username"]);
    return !!review ? {
        _id: review._id.toHexString(),
        user: review.user,
        star: review.star,
    } : null;
}


const readPlaceReviewsAsync = async (placeId: string): Promise<Review[]> => {
    const reviews = await DBReview.find({ place: Types.ObjectId.createFromHexString(placeId) })
        .populate<{ user: Owner }>("user", ["username"]);
    return reviews.map(review => ({
        _id: review._id.toHexString(),
        user: review.user,
        star: review.star,
    }));
}

const readUserReviewsAsync = async (userId: string): Promise<Review[]> => {
    const reviews = await DBReview.find({ user: Types.ObjectId.createFromHexString(userId) })
        .populate<{ user: Owner }>("user", ["username"]);
    return reviews.map(review => ({
        _id: review._id.toHexString(),
        user: review.user,
        star: review.star,
    }));
}

const updateReviewAsync = async (id: string, newData: UpdateFields<Review>): Promise<boolean> => {
    const result = await DBReview.updateOne({ _id: Types.ObjectId.createFromHexString(id) }, newData);
    return result.modifiedCount > 0;
};

const deleteReviewAsync = async (id: string): Promise<boolean> => {
    const result = await DBReview.deleteOne({_id: Types.ObjectId.createFromHexString(id)});
    return result.deletedCount > 0;
};

export {
    createReviewAsync,
    readReviewAsync,
    readPlaceReviewsAsync,
    readUserReviewsAsync,
    updateReviewAsync,
    deleteReviewAsync,
}