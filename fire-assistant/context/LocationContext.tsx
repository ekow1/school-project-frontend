import * as Location from 'expo-location';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

interface LocationContextType {
  location: LocationData | null;
  setLocation: (location: LocationData | null) => void;
  refreshLocation: () => Promise<void>;
  loading: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false); // Start as false to prevent blocking
  const { token, user, isInitialized } = useAuthStore();
  const isInitializingRef = React.useRef(false);

  const refreshLocation = React.useCallback(async () => {
    // Prevent multiple simultaneous location requests
    if (isInitializingRef.current) {
      return;
    }

    // Only request location if user is authenticated
    if (!token || !user) {
      setLoading(false);
      return;
    }

    isInitializingRef.current = true;
    setLoading(true);
    
    try {
      // Check if location services are available
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        console.warn('Location services are disabled');
        setLoading(false);
        isInitializingRef.current = false;
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission not granted');
        setLoading(false);
        isInitializingRef.current = false;
        return;
      }

      // Add timeout for location request (20 seconds for first attempt, longer timeout)
      const locationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 20000, // Increased timeout to 20 seconds
        maximumAge: 300000, // Accept cached location up to 5 minutes old for faster response
      });
      
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Location request timeout')), 20000)
      );
      
      const loc = await Promise.race([locationPromise, timeoutPromise]);
      
      if (!loc || !loc.coords || typeof loc.coords.latitude !== 'number' || typeof loc.coords.longitude !== 'number') {
        throw new Error('Invalid location data received');
      }

      let address = 'Current Location';
      try {
        const geocode = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        
        if (geocode && geocode.length > 0) {
          const g = geocode[0];
          address = [g.name, g.street, g.city, g.region, g.country]
            .filter(Boolean)
            .join(', ');
        }
      } catch (e) {
        console.warn('Failed to get address:', e);
        // Continue with default address
      }

      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        address,
      });
    } catch (error: any) {
      console.error('Failed to get location:', error);
      // Don't set location on error - let the app continue without location
      // The UI should handle the case where location is null
      // Don't crash the app - just log the error
    } finally {
      setLoading(false);
      isInitializingRef.current = false;
    }
  }, [token, user]);

  useEffect(() => {
    // Wait for auth to be initialized before trying to get location
    if (!isInitialized) {
      setLoading(false);
      return;
    }

    // Only request location if user is authenticated
    if (token && user) {
      // Add a longer delay to ensure app and location services are fully initialized
      // Also add retry logic for better reliability
      let retryCount = 0;
      const maxRetries = 2;
      
      const attemptLocation = async () => {
        try {
          await refreshLocation();
        } catch (error) {
          console.warn(`Location attempt ${retryCount + 1} failed:`, error);
          retryCount++;
          
          // Retry after a delay if we haven't exceeded max retries
          if (retryCount <= maxRetries) {
            setTimeout(() => {
              attemptLocation();
            }, 2000); // Wait 2 seconds before retry
          }
        }
      };

      // Initial delay - give the app more time to initialize (1.5 seconds)
      const timer = setTimeout(() => {
        attemptLocation();
      }, 1500);

      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, [token, user, isInitialized, refreshLocation]);

  const value: LocationContextType = {
    location,
    setLocation,
    refreshLocation,
    loading,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    // Return a fallback context silently to avoid warnings
    return {
      location: null,
      setLocation: () => {},
      refreshLocation: async () => {},
      loading: true,
    };
  }
  return context;
};