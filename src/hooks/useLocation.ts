import { useState, useEffect } from 'react';
import { LocationService } from '@/services/locationService';
import { Coordinates } from '@/utils/locationUtils';

export const useLocation = () => {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        setIsLoading(true);
        const hasPermission = await LocationService.requestPermissions();
        
        setHasLocationPermission(hasPermission);

        if (hasPermission) {
          const location = await LocationService.getCurrentLocation();
          setUserLocation(location);
        }
      } catch (error) {
        console.error('Error requesting location permission:', error);
      } finally {
        setIsLoading(false);
      }
    };

    requestLocationPermission();
  }, []);

  const refreshLocation = async () => {
    try {
      setIsLoading(true);
      const hasPermission = await LocationService.requestPermissions();
      setHasLocationPermission(hasPermission);

      if (hasPermission) {
        const location = await LocationService.getCurrentLocation();
        setUserLocation(location);
      }
    } catch (error) {
      console.error('Error refreshing location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    userLocation,
    hasLocationPermission,
    isLoading,
    refreshLocation,
  };
}; 