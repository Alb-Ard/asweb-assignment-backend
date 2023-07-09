import { createNotificationAsync } from "../controllers/notificationController";
import { readPlaceAsync } from "../controllers/placeController";
import { readReviewAsync } from "../controllers/reviewController";

export const notifyReviewAsync = async (placeId: string, reviewerUserId: string) => {
    try {
        const place = await readPlaceAsync(placeId);
        const review = await readReviewAsync(placeId, reviewerUserId);
        if (!!!place || !!!review) {
            console.error(`Could not find data to notify review (placeId: ${placeId} reviewerUserId: ${reviewerUserId})`);
            return;
        }
        const message = `Your place ${place.name} has just received a new review of ${review.star} stars!`;
        await createNotificationAsync(place.owner._id, message, Date.now());
    } catch (err) {
        console.error("Could not notify review: " + err);
    }
}

export const notifyPlaceInItineraryAsync = async (placeId: string) => {
    try {
        const place = await readPlaceAsync(placeId);
        if (!!!place) {
            console.error(`Could not find data to notify place in itinerary (placeId: ${placeId})`);
            return;
        }
        const message = `Your place ${place.name} has just been added to an itinerary!`;
        await createNotificationAsync(place.owner._id, message, Date.now());
    } catch (err) {
        console.error("Could not notify place in itinerary: " + err);
    }
}