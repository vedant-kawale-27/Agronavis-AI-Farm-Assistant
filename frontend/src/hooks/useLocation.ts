import { useState } from 'react';

interface LocationState {
  fetching: boolean;
  error: string;
  success: boolean;
}

interface LocationData {
  latitude: string;
  longitude: string;
}

export const useLocation = () => {
  const [locationStatus, setLocationStatus] = useState<LocationState>({
    fetching: false,
    error: '',
    success: false
  });

  const getCurrentLocation = (
    onSuccess: (location: LocationData) => void
  ) => {
    if (!navigator.geolocation) {
      setLocationStatus({
        fetching: false,
        error: 'Geolocation is not supported by this browser',
        success: false
      });
      return;
    }

    setLocationStatus({
      fetching: true,
      error: '',
      success: false
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        };
        
        onSuccess(location);
        
        setLocationStatus({
          fetching: false,
          error: '',
          success: true
        });
      },
      (error) => {
        setLocationStatus({
          fetching: false,
          error: `Unable to retrieve your location: ${error.message}`,
          success: false
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return {
    locationStatus,
    getCurrentLocation
  };
};