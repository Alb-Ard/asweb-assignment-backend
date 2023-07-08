import Owner from "./owner";

interface Review {
    readonly _id: string,
    readonly user: Owner,
    readonly star: number,
}

export default Review;