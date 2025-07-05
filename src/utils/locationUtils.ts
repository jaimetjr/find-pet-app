export interface Coordinates {
  latitude: number;
  longitude: number;
}

export const getCoordinatesFromAddress = async (
  cep: string, 
  address: string, 
  city: string, 
  state: string
): Promise<Coordinates | null> => {
  try {
    const addressString = `${address}, ${city}, ${state}, Brasil`;
    const encodedAddress = encodeURIComponent(addressString);
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API}`
    );
    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting coordinates:', error);
    return null;
  }
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
}; 