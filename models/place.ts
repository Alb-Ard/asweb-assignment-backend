import Owner from "./owner";
import Review from "./review";

interface Place {
    readonly _id: string,
    readonly owner: Owner,
    readonly name: string,
    readonly description: string
    readonly location: [number, number],
    readonly photoSrcs: string[],
    readonly reviews: Review[]
}
export default Place;