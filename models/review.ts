import Owner from "./owner";
import Place from "./place";

interface Review {
    readonly _id: string,
    readonly place: Place,
    readonly user: Owner
}

export default Review;