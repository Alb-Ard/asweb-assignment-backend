"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReviewAsync = exports.updateReviewAsync = exports.readUserReviewsAsync = exports.readPlaceReviewsAsync = exports.readReviewAsync = exports.createReviewAsync = void 0;
const mongoose_1 = require("mongoose");
const db_1 = require("../lib/db");
const reviewSchema = new mongoose_1.Schema({
    star: Number,
    place: { type: mongoose_1.Schema.Types.ObjectId, ref: "places" },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "users" },
});
const DBReview = (0, mongoose_1.model)("reviews", reviewSchema);
const createReviewAsync = async (star, placeId, userId) => {
    return (await new DBReview({
        star: star,
        place: mongoose_1.Types.ObjectId.createFromHexString(placeId),
        user: mongoose_1.Types.ObjectId.createFromHexString(userId),
    }).save())?._id?.toHexString();
};
exports.createReviewAsync = createReviewAsync;
const readReviewAsync = async (placeId, userId) => {
    const review = await DBReview.findOne({ place: mongoose_1.Types.ObjectId.createFromHexString(placeId), user: mongoose_1.Types.ObjectId.createFromHexString(userId) })
        .populate("user", ["username"]);
    return !!review ? {
        _id: review._id.toHexString(),
        user: (0, db_1.mapOwner)(review.user),
        star: review.star,
    } : null;
};
exports.readReviewAsync = readReviewAsync;
const readPlaceReviewsAsync = async (placeId) => {
    const reviews = await DBReview.find({ place: mongoose_1.Types.ObjectId.createFromHexString(placeId) })
        .populate("user", ["username"]);
    return reviews.map(review => ({
        _id: review._id.toHexString(),
        user: (0, db_1.mapOwner)(review.user),
        star: review.star,
    }));
};
exports.readPlaceReviewsAsync = readPlaceReviewsAsync;
const readUserReviewsAsync = async (userId) => {
    const reviews = await DBReview.find({ user: mongoose_1.Types.ObjectId.createFromHexString(userId) })
        .populate("user", ["username"]);
    return reviews.map(review => ({
        _id: review._id.toHexString(),
        user: (0, db_1.mapOwner)(review.user),
        star: review.star,
    }));
};
exports.readUserReviewsAsync = readUserReviewsAsync;
const updateReviewAsync = async (id, newData) => {
    const result = await DBReview.updateOne({ _id: mongoose_1.Types.ObjectId.createFromHexString(id) }, newData);
    return result.modifiedCount > 0;
};
exports.updateReviewAsync = updateReviewAsync;
const deleteReviewAsync = async (id) => {
    const result = await DBReview.deleteOne({ _id: mongoose_1.Types.ObjectId.createFromHexString(id) });
    return result.deletedCount > 0;
};
exports.deleteReviewAsync = deleteReviewAsync;
