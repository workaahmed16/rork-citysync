import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState, useCallback, useMemo } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LocationPermissionContextType {
  hasLocationPermission: boolean;
  currentLocation: Location.LocationObject | null;
  userCity: string | null;
  userCountry: string | null;
  isLoadingLocation: boolean;
  locationError: string | null;
  requestLocationPermission: () => Promise<boolean>;
  updateUserLocation: (city: string, country: string) => Promise<void>;
  getCurrentLocation: () => Promise<void>;
  detectAndSetLocation: () => Promise<{ city: string; country: string } | null>;
  clearLocationError: () => void;
}

export const [LocationPermissionProvider, useLocationPermission] = createContextHook((): LocationPermissionContextType => {
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean>(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [userCity, setUserCity] = useState<string | null>(null);
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [hasGeocodedThisSession, setHasGeocodedThisSession] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const loadStoredLocation = async () => {
    try {
      const storedCity = await AsyncStorage.getItem('userCity');
      const storedCountry = await AsyncStorage.getItem('userCountry');
      const lastGeocodedSession = await AsyncStorage.getItem('lastGeocodedSession');
      
      // Validate and set city
      if (storedCity && storedCity.trim() && storedCity !== 'undefined' && storedCity !== 'null' && !storedCity.startsWith('[object') && !storedCity.startsWith('object Object')) {
        setUserCity(storedCity);
      } else if (storedCity) {
        console.warn('Detected corrupted city data, clearing:', storedCity.substring(0, 50));
        await AsyncStorage.removeItem('userCity');
      }
      
      // Validate and set country
      if (storedCountry && storedCountry.trim() && storedCountry !== 'undefined' && storedCountry !== 'null' && !storedCountry.startsWith('[object') && !storedCountry.startsWith('object Object')) {
        setUserCountry(storedCountry);
      } else if (storedCountry) {
        console.warn('Detected corrupted country data, clearing:', storedCountry.substring(0, 50));
        await AsyncStorage.removeItem('userCountry');
      }
      
      // Check if we've already geocoded in this session
      let sessionDiff = Infinity;
      if (lastGeocodedSession && lastGeocodedSession.trim() && lastGeocodedSession !== 'undefined' && lastGeocodedSession !== 'null' && !lastGeocodedSession.startsWith('[object') && !lastGeocodedSession.startsWith('object Object')) {
        try {
          const timestamp = parseInt(lastGeocodedSession, 10);
          if (!isNaN(timestamp) && timestamp > 0) {
            sessionDiff = Date.now() - timestamp;
          } else {
            // Invalid timestamp, clear it
            await AsyncStorage.removeItem('lastGeocodedSession');
          }
        } catch (parseError) {
          console.error('Error parsing lastGeocodedSession:', parseError);
          await AsyncStorage.removeItem('lastGeocodedSession');
        }
      } else if (lastGeocodedSession) {
        console.warn('Detected corrupted session data, clearing:', lastGeocodedSession.substring(0, 50));
        await AsyncStorage.removeItem('lastGeocodedSession');
      }
      
      // Only geocode if it's been more than 1 hour since last geocoding
      if (sessionDiff > 3600000) { // 1 hour in milliseconds
        setHasGeocodedThisSession(false);
      } else {
        setHasGeocodedThisSession(true);
      }
    } catch (error) {
      console.error('Error loading stored location:', error);
      // Clear potentially corrupted data
      try {
        await AsyncStorage.removeItem('userCity');
        await AsyncStorage.removeItem('userCountry');
        await AsyncStorage.removeItem('lastGeocodedSession');
      } catch (clearError) {
        console.error('Error clearing location data:', clearError);
      }
      setLocationError('Failed to load saved location');
    }
  };

  const getCurrentLocation = useCallback(async () => {
    if (Platform.OS === 'web' || !hasLocationPermission || hasGeocodedThisSession) {
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);
    
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setCurrentLocation(location);
      
      // Only geocode if we haven't done it this session
      if (!hasGeocodedThisSession) {
        try {
          const reverseGeocode = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          
          if (reverseGeocode.length > 0) {
            const address = reverseGeocode[0];
            const city = address.city || address.subregion || 'Unknown City';
            const country = address.country || 'Unknown Country';
            
            setUserCity(city);
            setUserCountry(country);
            
            // Store in AsyncStorage with session timestamp
            await AsyncStorage.setItem('userCity', city);
            await AsyncStorage.setItem('userCountry', country);
            await AsyncStorage.setItem('lastGeocodedSession', Date.now().toString());
            
            setHasGeocodedThisSession(true);
            console.log(`Location detected: ${city}, ${country}`);
          }
        } catch (geocodeError) {
          console.error('Geocoding failed:', geocodeError);
          setLocationError('Unable to determine city from location. You can set it manually in your profile.');
        }
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      const errorObj = error as any;
      if (errorObj?.code === 'E_LOCATION_TIMEOUT') {
        setLocationError('Location request timed out. Please try again or set your location manually.');
      } else if (errorObj?.code === 'E_LOCATION_UNAVAILABLE') {
        setLocationError('Location services unavailable. Please enable GPS and try again.');
      } else {
        setLocationError('Unable to get your location. You can set it manually in your profile.');
      }
    } finally {
      setIsLoadingLocation(false);
    }
  }, [hasLocationPermission, hasGeocodedThisSession]);

  const checkLocationPermission = useCallback(async () => {
    if (Platform.OS === 'web') {
      setHasLocationPermission(false);
      return;
    }

    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      const granted = status === 'granted';
      setHasLocationPermission(granted);
      
      if (granted) {
        await getCurrentLocation();
      } else {
        console.log('Location permission not granted, user can set location manually');
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
      setHasLocationPermission(false);
      setLocationError('Unable to check location permissions');
    }
  }, [getCurrentLocation]);

  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      setLocationError('Location services are not available on web. Please set your location manually.');
      return false;
    }

    setLocationError(null);
    setIsLoadingLocation(true);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setHasLocationPermission(granted);
      
      if (granted) {
        setHasGeocodedThisSession(false);
        await getCurrentLocation();
      } else {
        setLocationError('Location permission denied. You can set your location manually in your profile.');
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLocationError('Unable to request location permission. Please check your device settings.');
      return false;
    } finally {
      setIsLoadingLocation(false);
    }
  }, [getCurrentLocation]);

  const updateUserLocation = useCallback(async (city: string, country: string) => {
    if (!city.trim() || !country.trim()) {
      setLocationError('City and country cannot be empty');
      return;
    }
    
    if (city.length > 100 || country.length > 100) {
      setLocationError('City and country names are too long (max 100 characters)');
      return;
    }
    
    const sanitizedCity = city.trim();
    const sanitizedCountry = country.trim();
    
    try {
      setUserCity(sanitizedCity);
      setUserCountry(sanitizedCountry);
      setLocationError(null);
      
      await AsyncStorage.setItem('userCity', sanitizedCity);
      await AsyncStorage.setItem('userCountry', sanitizedCountry);
      
      console.log(`Location updated: ${sanitizedCity}, ${sanitizedCountry}`);
    } catch (error) {
      console.error('Error updating user location:', error);
      setLocationError('Failed to save location. Please try again.');
    }
  }, []);

  const detectAndSetLocation = useCallback(async (): Promise<{ city: string; country: string } | null> => {
    if (Platform.OS === 'web') {
      setLocationError('Location services are not available on web. Please set your location manually.');
      return null;
    }
    try {
      setIsLoadingLocation(true);
      setLocationError(null);
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const req = await Location.requestForegroundPermissionsAsync();
        if (req.status !== 'granted') {
          setLocationError('Location permission denied. You can set your location manually in your profile.');
          return null;
        }
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCurrentLocation(location);
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const city = (address.city || address.subregion || 'Unknown City') as string;
        const country = (address.country || 'Unknown Country') as string;
        setUserCity(city);
        setUserCountry(country);
        await AsyncStorage.setItem('userCity', city);
        await AsyncStorage.setItem('userCountry', country);
        await AsyncStorage.setItem('lastGeocodedSession', Date.now().toString());
        setHasGeocodedThisSession(true);
        return { city, country };
      }
      setLocationError('Unable to determine city from location. You can set it manually in your profile.');
      return null;
    } catch (error) {
      console.error('detectAndSetLocation error:', error);
      setLocationError('Unable to get your location. You can set it manually in your profile.');
      return null;
    } finally {
      setIsLoadingLocation(false);
    }
  }, []);

  const clearLocationError = useCallback(() => {
    setLocationError(null);
  }, []);

  // Initialize on mount
  useEffect(() => {
    if (!isInitialized) {
      const initialize = async () => {
        await loadStoredLocation();
        await checkLocationPermission();
        setIsInitialized(true);
      };
      initialize();
    }
  }, [isInitialized, checkLocationPermission]);

  return useMemo(() => ({
    hasLocationPermission,
    currentLocation,
    userCity,
    userCountry,
    isLoadingLocation,
    locationError,
    requestLocationPermission,
    updateUserLocation,
    getCurrentLocation,
    detectAndSetLocation,
    clearLocationError,
  }), [
    hasLocationPermission,
    currentLocation,
    userCity,
    userCountry,
    isLoadingLocation,
    locationError,
    requestLocationPermission,
    updateUserLocation,
    getCurrentLocation,
    detectAndSetLocation,
    clearLocationError,
  ]);
});