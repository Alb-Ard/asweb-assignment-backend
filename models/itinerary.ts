import Owner from "./owner"

interface Itinerary {
    id: string,
    owner: Owner,
    name: string,
    places: ItineraryPlace[]
}

interface ItineraryPlace {
    id: string,
    name: string,
    location: [number, number]
}

export default Itinerary;
export {
    ItineraryPlace
};