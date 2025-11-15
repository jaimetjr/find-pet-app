import * as Location from 'expo-location';
import type { Coordinates, LocationWithAddress } from '../types/location';
import { ERROR_MESSAGES } from '@/constants';
import { ErrorHandler } from '@/utils/errorHandler';

export class LocationService {
    // Prevent multiple simultaneous location requests
    private static locationRequestPromise: Promise<Coordinates | null> | null = null;
    static async requestPermissions() : Promise<boolean> {
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status === 'granted';
    }

    static async checkLocationServicesEnabled(): Promise<boolean> {
        try {
            const isEnabled = await Location.hasServicesEnabledAsync();
            console.log('Location services enabled:', isEnabled);
            return isEnabled;
        } catch (error) {
            ErrorHandler.logError(error, 'LocationService.checkLocationServicesEnabled');
            return false;
        }
    }

    static async getCurrentLocation(retries: number = 2) : Promise<Coordinates | null> {
        // If there's already a location request in progress, wait for it
        if (this.locationRequestPromise) {
            console.log('Location request already in progress, waiting for existing request...');
            return this.locationRequestPromise;
        }

        // Create and store the promise
        this.locationRequestPromise = this._getCurrentLocationInternal(retries);
        
        try {
            return await this.locationRequestPromise;
        } finally {
            // Clear the promise when done
            this.locationRequestPromise = null;
        }
    }

    private static async _getCurrentLocationInternal(retries: number = 2) : Promise<Coordinates | null> {
        try {
            // First check if location services are enabled on the device
            const servicesEnabled = await this.checkLocationServicesEnabled();
            if (!servicesEnabled) {
                console.warn('Location services are disabled on the device');
                return null;
            }

            // Then check and request permissions
            const hasPermission = await this.requestPermissions();
            console.log('hasPermission', hasPermission);
            if (!hasPermission) {
                return null;
            }

            // Retry logic for Android emulator flakiness
            let lastError: Error | null = null;
            for (let attempt = 0; attempt <= retries; attempt++) {
                try {
                    if (attempt > 0) {
                        // Wait before retrying (exponential backoff)
                        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 3000);
                        console.log(`Retrying location request (attempt ${attempt + 1}/${retries + 1}) after ${delay}ms`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }

                    const location = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced
                    });
                    console.log('location', location);
                    return {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude
                    };
                } catch (error: any) {
                    lastError = error;
                    const errorMessage = error?.message || String(error);
                    
                    // Don't retry if it's a permission issue
                    if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
                        console.warn('Location permission denied, not retrying');
                        break;
                    }
                    
                    // Log but continue to retry for other errors (like Android emulator flakiness)
                    if (attempt < retries) {
                        console.warn(`Location request failed (attempt ${attempt + 1}/${retries + 1}):`, errorMessage);
                    }
                }
            }

            // All retries failed
            if (lastError) {
                const errorMessage = lastError?.message || String(lastError);
                // Only log as error if it's not the common Android emulator issue
                if (!errorMessage.includes('Current location is unavailable')) {
                    ErrorHandler.logError(lastError, 'LocationService.getCurrentLocation');
                } else {
                    // Android emulator flakiness - log as warning instead
                    console.warn('Location temporarily unavailable (this is common on Android emulators):', errorMessage);
                }
            }
            return null;
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