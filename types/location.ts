export type Coordinates = {
    latitude: number;
    longitude : number;
}

export type LocationWithAddress = {
    coordinates : Coordinates;
    address : string;
}

export function calculateDistance(firstLat : number, firstLon : number, secondLat : number, secondLon : number) : number {
    const R = 6371;
    const dLat = deg2rad(secondLat - firstLat);
    const dLon = deg2rad(secondLon - firstLon);
    const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(firstLat)) * Math.cos(deg2rad(firstLon)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c
    return d
}

function deg2rad(deg : number) : number {
    return deg * (Math.PI / 180);
}