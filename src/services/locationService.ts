import * as Location from 'expo-location';
import * as Device from 'expo-device';
import type { Coordinates, LocationWithAddress } from '../types/location';
import { ERROR_MESSAGES, DEFAULTS } from '@/constants';
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
            // Check if running on emulator/simulator
            const isEmulator = !Device.isDevice;
            
            // First check if location services are enabled on the device
            const servicesEnabled = await this.checkLocationServicesEnabled();
            if (!servicesEnabled) {
                if (isEmulator) {
                    console.log('📍 Location services unavailable on emulator, will use mock location if location request fails');
                } else {
                    console.warn('Location services are disabled on the device. Please enable them in device settings.');
                    return null;
                }
            }

            // Then check and request permissions
            const hasPermission = await this.requestPermissions();
            if (!hasPermission) {
                if (isEmulator) {
                    console.log('📍 Location permission unavailable on emulator, will use mock location if location request fails');
                } else {
                    console.warn('Location permission was denied. Please grant location permission in app settings.');
                    return null;
                }
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

                    // Create timeout promise to prevent hanging (30 seconds for GPS to get a fix)
                    const timeoutMs = 30000; // 30 seconds - GPS can take time
                    let timeoutId: ReturnType<typeof setTimeout> | null = null;
                    const timeoutPromise = new Promise<never>((_, reject) => {
                        timeoutId = setTimeout(() => {
                            reject(new Error('Location request timeout after 30 seconds. GPS may be slow or unavailable.'));
                        }, timeoutMs);
                    });

                    // Race between location request and timeout
                    let locationResult: Location.LocationObject | null = null;
                    try {
                        locationResult = await Promise.race([
                            Location.getCurrentPositionAsync({
                                accuracy: Location.Accuracy.Balanced
                            }),
                            timeoutPromise
                        ]);
                        
                        // Clear timeout if location succeeds
                        if (timeoutId) {
                            clearTimeout(timeoutId);
                            timeoutId = null;
                        }
                    } catch (raceError: any) {
                        // Clear timeout if error occurs
                        if (timeoutId) {
                            clearTimeout(timeoutId);
                            timeoutId = null;
                        }
                        throw raceError;
                    }
                    
                    if (locationResult) {
                        console.log('Location retrieved successfully:', {
                            latitude: locationResult.coords.latitude,
                            longitude: locationResult.coords.longitude
                        });
                        return {
                            latitude: locationResult.coords.latitude,
                            longitude: locationResult.coords.longitude
                        };
                    }
                    
                    // Should not reach here, but TypeScript safety
                    throw new Error('Location request returned null');
                } catch (error: any) {
                    lastError = error;
                    const errorMessage = error?.message || String(error);
                    
                    // Check if it's a timeout error
                    const isTimeoutError = errorMessage.includes('timeout');
                    
                    // Check if it's a permission-related error
                    const isPermissionError = errorMessage.toLowerCase().includes('permission') || 
                                            errorMessage.toLowerCase().includes('denied') ||
                                            errorMessage.toLowerCase().includes('not authorized');
                    
                    // Check if it's an unavailable location error (common on emulators)
                    const isUnavailableError = errorMessage.includes('Current location is unavailable') ||
                                             errorMessage.includes('location is unavailable') ||
                                             errorMessage.includes('Location request failed');
                    
                    // Don't retry if it's a permission issue
                    if (isPermissionError) {
                        console.warn('Location permission denied, not retrying');
                        break;
                    }
                    
                    // For timeout errors, provide more helpful message
                    if (isTimeoutError) {
                        console.warn(`Location request timed out after 30 seconds (attempt ${attempt + 1}/${retries + 1}). This may happen if:`, [
                            'GPS signal is weak or unavailable',
                            'Using a simulator without location simulation',
                            'Device location services are slow to respond',
                            'Network-based location is disabled'
                        ].join('\n- '));
                        
                        // Don't retry timeout errors - they're unlikely to succeed
                        if (attempt < retries) {
                            console.log(`Will retry with fresh request (attempt ${attempt + 1}/${retries + 1})...`);
                        }
                    } else {
                        // Log appropriate message based on error type
                        if (attempt < retries) {
                            if (isUnavailableError) {
                                // Silent retry for unavailable errors (common on emulators/devices)
                                console.log(`Location temporarily unavailable, retrying (attempt ${attempt + 1}/${retries + 1})...`);
                            } else {
                                console.warn(`Location request failed (attempt ${attempt + 1}/${retries + 1}):`, errorMessage);
                            }
                        }
                    }
                }
            }

            // All retries failed - check if we should use fallback location
            if (lastError) {
                const errorMessage = lastError?.message || String(lastError);
                const isUnavailableError = errorMessage.includes('Current location is unavailable') ||
                                         errorMessage.includes('location is unavailable') ||
                                         errorMessage.includes('Location request failed') ||
                                         errorMessage.includes('timeout');
                
                // If running on emulator/simulator and location fails, use mock location for development
                const isEmulator = !Device.isDevice;
                if (isEmulator) {
                    const mockLocation = this.getMockLocation();
                    console.log(`📍 Location unavailable on emulator. Using mock location: São Paulo, Brazil (${mockLocation.latitude}, ${mockLocation.longitude})`);
                    console.log('📍 To test with real GPS, use a physical device or set location in emulator settings.');
                    return mockLocation;
                }
                
                if (isUnavailableError) {
                    // Common issue on emulators or when location services are temporarily unavailable
                    console.warn('Location unavailable after retries. This may happen if:', [
                        'Location services are disabled in device settings',
                        'Using an emulator without location simulation',
                        'GPS signal is weak or unavailable',
                        'Device is in airplane mode'
                    ].join('\n- '));
                } else {
                    ErrorHandler.logError(lastError, 'LocationService.getCurrentLocation');
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

    /**
     * Returns a mock location for development/testing on emulators/simulators
     * Uses São Paulo, Brazil coordinates as default
     */
    private static getMockLocation(): Coordinates {
        // São Paulo, Brazil coordinates (default for Brazilian app)
        return {
            latitude: -23.5505,
            longitude: -46.6333
        };
    }
}