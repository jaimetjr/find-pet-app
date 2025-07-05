import * as Location from 'expo-location';
import type { Coordinates, LocationWithAddress } from '../types/location';
import { ERROR_MESSAGES } from '@/constants';
import { ErrorHandler } from '@/utils/errorHandler';

export class LocationService {
    static async requestPermissions() : Promise<boolean> {
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status === 'granted';
    }

    static async getCurrentLocation() : Promise<Coordinates | null> {
        try {
            const hasPermission = this.requestPermissions();
            if (!hasPermission) {
                return null;
            }
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced
            })

            return {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            };
        } catch (error) {
            ErrorHandler.logError(error, 'LocationService.getCurrentLocation');
            return null;
        }
    }

    static async getAddressFromCoordinates(coordinates : Coordinates) : Promise<string> {
        try {
            const [location] = await Location.reverseGeocodeAsync({
                latitude: coordinates.latitude,
                longitude: coordinates.longitude
            })

            if (location) {
                const { city, region } = location;
                if (city && region) {
                    return `${city}, ${region}`
                } else if (city) {
                    return city;
                } else if (region) {
                    return region;
                }
            }
            return ERROR_MESSAGES.LOCATION_UNKNOWN;
        } catch (error) {
             ErrorHandler.logError(error, 'LocationService.getAddressFromCoordinates');
             return ERROR_MESSAGES.LOCATION_UNKNOWN;
        }
    }

    static async getFullLocation(): Promise<LocationWithAddress | null> {
        const coordinates = await this.getCurrentLocation()
        if (!coordinates) {
          return null
        }
    
        const address = await this.getAddressFromCoordinates(coordinates)
        return {
          coordinates,
          address,
        }
    }
}