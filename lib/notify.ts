import { createNotificationAsync } from "../controllers/notificationController";
import { readPlaceAsync } from "../controllers/placeController";
import { readReviewAsync } from "../controllers/reviewController";
import { sendMessageToClient } from "./socket";

export const notifyNewReviewAsync = async (placeId: string, reviewerUserId: string) => {
    try {
        const place = await readPlaceAsync(placeId);
        const review = await readReviewAsync(placeId, reviewerUserId);
        if (!!!place || !!!review) {
            console.error(`Could not find data to notify review (placeId: ${placeId} reviewerUserId: ${reviewerUserId})`);
            return;
        }
        const message = `Your place \"${place.name}\" has just received a new review of ${review.star} stars!`;
        await createNotificationAndSendAsync(place.owner._id, message);
    } catch (err) {
        console.error(`Could not notify review (placeId: ${placeId} reviewerUserId: ${reviewerUserId}): ${err}`);
    }
}

export const notifyChangedReviewAsync = async (placeId: string, reviewerUserId: string) => {
    try {
        const place = await readPlaceAsync(placeId);
        const review = await readReviewAsync(placeId, reviewerUserId);
        if (!!!place || !!!review) {
            console.error(`Could not find data to notify review (placeId: ${placeId} reviewerUserId: ${reviewerUserId})`);
            return;
        }
        const message = `A review on your place \"${place.name}\" has just been changed to ${review.star} stars!`;
        await createNotificationAndSendAsync(place.owner._id, message);
    } catch (err) {
        console.error(`Could not notify review (placeId: ${placeId} reviewerUserId: ${reviewerUserId}): ${err}`);
    }
}

export const notifyPlaceInItineraryAsync = async (placeId: string) => {
    try {
        const place = await readPlaceAsync(placeId);
        if (!!!place) {
            console.error(`Could not find data to notify place in itinerary (placeId: ${placeId})`);
            return;
        }
        const message = `Your place \"${place.name}\" has just been added to an itinerary!`;
        await createNotificationAndSendAsync(place.owner._id, message);
    } catch (err) {
        console.error(`Could not notify review (placeId: ${placeId}): ${err}`);
    }
}

const createNotificationAndSendAsync = async (userId: string, message: string) => {
    console.log("NOTIFY Created notification \"" + message + "\" for user " + userId);
    const notification = await createNotificationAsync(userId, message, Date.now());
    if (!!notification) {
        sendMessageToClient(userId, "notification", notification);
    }
}