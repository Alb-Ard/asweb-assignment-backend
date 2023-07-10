"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyPlaceInItineraryAsync = exports.notifyChangedReviewAsync = exports.notifyNewReviewAsync = void 0;
const notificationController_1 = require("../controllers/notificationController");
const placeController_1 = require("../controllers/placeController");
const reviewController_1 = require("../controllers/reviewController");
const socket_1 = require("./socket");
const notifyNewReviewAsync = async (placeId, reviewerUserId) => {
    try {
        const place = await (0, placeController_1.readPlaceAsync)(placeId);
        const review = await (0, reviewController_1.readReviewAsync)(placeId, reviewerUserId);
        if (!!!place || !!!review) {
            console.error(`Could not find data to notify review (placeId: ${placeId} reviewerUserId: ${reviewerUserId})`);
            return;
        }
        const message = `Your place \"${place.name}\" has just received a new review of ${review.star} stars!`;
        await createNotificationAndSendAsync(place.owner._id, message);
    }
    catch (err) {
        console.error(`Could not notify review (placeId: ${placeId} reviewerUserId: ${reviewerUserId}): ${err}`);
    }
};
exports.notifyNewReviewAsync = notifyNewReviewAsync;
const notifyChangedReviewAsync = async (placeId, reviewerUserId) => {
    try {
        const place = await (0, placeController_1.readPlaceAsync)(placeId);
        const review = await (0, reviewController_1.readReviewAsync)(placeId, reviewerUserId);
        if (!!!place || !!!review) {
            console.error(`Could not find data to notify review (placeId: ${placeId} reviewerUserId: ${reviewerUserId})`);
            return;
        }
        const message = `A review on your place \"${place.name}\" has just been changed to ${review.star} stars!`;
        await createNotificationAndSendAsync(place.owner._id, message);
    }
    catch (err) {
        console.error(`Could not notify review (placeId: ${placeId} reviewerUserId: ${reviewerUserId}): ${err}`);
    }
};
exports.notifyChangedReviewAsync = notifyChangedReviewAsync;
const notifyPlaceInItineraryAsync = async (placeId) => {
    try {
        const place = await (0, placeController_1.readPlaceAsync)(placeId);
        if (!!!place) {
            console.error(`Could not find data to notify place in itinerary (placeId: ${placeId})`);
            return;
        }
        const message = `Your place \"${place.name}\" has just been added to an itinerary!`;
        await createNotificationAndSendAsync(place.owner._id, message);
    }
    catch (err) {
        console.error(`Could not notify review (placeId: ${placeId}): ${err}`);
    }
};
exports.notifyPlaceInItineraryAsync = notifyPlaceInItineraryAsync;
const createNotificationAndSendAsync = async (userId, message) => {
    console.log("NOTIFY Created notification \"" + message + "\" for user " + userId);
    const notification = await (0, notificationController_1.createNotificationAsync)(userId, message, Date.now());
    if (!!notification) {
        (0, socket_1.sendMessageToClient)(userId, "notification", notification);
    }
};
