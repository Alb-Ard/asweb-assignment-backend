import Owner from "./owner";

interface Place {
    readonly id: string,
    readonly owner: Owner,
    readonly name: string,
    readonly description: string
    readonly location: [number, number],
    readonly photoSrcs: string[],
    readonly reviews: string[],
}
export default Place;