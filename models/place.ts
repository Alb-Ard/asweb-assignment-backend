import User from "./user";

interface Place {
    id: string,
    owner: PlaceOwner,
    name: string,
    location: [number, number],
    photoSrcs: string[],
    reviews: string[],
}

interface PlaceOwner {
    id: string,
    name: string
}

export default Place;
export { PlaceOwner };