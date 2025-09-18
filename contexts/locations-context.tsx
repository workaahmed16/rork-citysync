import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import type { Location, Review, CreateReviewData } from '@/types';
import { mockLocations, mockReviews } from '@/data/mock-data';

interface LocationsContextType {
  locations: Location[];
  reviews: Review[];
  isLoading: boolean;
  searchLocations: (query: string) => Location[];
  getLocationById: (id: string) => Location | undefined;
  getLocationReviews: (locationId: string) => Review[];
  addReview: (reviewData: CreateReviewData) => Promise<void>;
  addLocation: (locationData: Omit<Location, 'id'>) => Promise<void>;
  getRecentReviews: () => Review[];
}

export const [LocationsProvider, useLocations] = createContextHook((): LocationsContextType => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedLocations = await AsyncStorage.getItem('locations');
      const storedReviews = await AsyncStorage.getItem('reviews');
      
      // Parse locations with validation
      let parsedLocations = mockLocations;
      if (storedLocations && storedLocations.trim() && storedLocations !== 'undefined' && storedLocations !== 'null' && !storedLocations.startsWith('[object') && !storedLocations.startsWith('object Object')) {
        try {
          const parsed = JSON.parse(storedLocations);
          if (Array.isArray(parsed)) {
            parsedLocations = parsed;
          } else {
            console.warn('Invalid locations data structure, using mock data');
            await AsyncStorage.removeItem('locations');
          }
        } catch (parseError) {
          console.error('Error parsing locations data:', parseError);
          console.log('Corrupted locations data:', storedLocations.substring(0, 100));
          await AsyncStorage.removeItem('locations');
        }
      } else if (storedLocations) {
        console.warn('Detected corrupted locations data, clearing:', storedLocations.substring(0, 50));
        await AsyncStorage.removeItem('locations');
      }
      
      // Parse reviews with validation
      let parsedReviews = mockReviews;
      if (storedReviews && storedReviews.trim() && storedReviews !== 'undefined' && storedReviews !== 'null' && !storedReviews.startsWith('[object') && !storedReviews.startsWith('object Object')) {
        try {
          const parsed = JSON.parse(storedReviews);
          if (Array.isArray(parsed)) {
            parsedReviews = parsed;
          } else {
            console.warn('Invalid reviews data structure, using mock data');
            await AsyncStorage.removeItem('reviews');
          }
        } catch (parseError) {
          console.error('Error parsing reviews data:', parseError);
          console.log('Corrupted reviews data:', storedReviews.substring(0, 100));
          await AsyncStorage.removeItem('reviews');
        }
      } else if (storedReviews) {
        console.warn('Detected corrupted reviews data, clearing:', storedReviews.substring(0, 50));
        await AsyncStorage.removeItem('reviews');
      }
      
      setLocations(parsedLocations);
      setReviews(parsedReviews);
    } catch (error) {
      console.error('Error loading data:', error);
      // Clear potentially corrupted data
      try {
        await AsyncStorage.removeItem('locations');
        await AsyncStorage.removeItem('reviews');
      } catch (clearError) {
        console.error('Error clearing data:', clearError);
      }
      setLocations(mockLocations);
      setReviews(mockReviews);
    } finally {
      setIsLoading(false);
    }
  };

  const searchLocations = (query: string): Location[] => {
    if (!query.trim()) return locations;
    
    return locations.filter(location =>
      location.name.toLowerCase().includes(query.toLowerCase()) ||
      location.address.toLowerCase().includes(query.toLowerCase()) ||
      location.category.toLowerCase().includes(query.toLowerCase())
    );
  };

  const getLocationById = (id: string): Location | undefined => {
    return locations.find(location => location.id === id);
  };

  const getLocationReviews = (locationId: string): Review[] => {
    return reviews.filter(review => review.locationId === locationId);
  };

  const addReview = async (reviewData: CreateReviewData) => {
    try {
      const newReview: Review = {
        id: Date.now().toString(),
        ...reviewData,
        userId: '1', // Mock user ID
        userName: 'Current User',
        createdAt: new Date().toISOString(),
      };

      const updatedReviews = [newReview, ...reviews];
      setReviews(updatedReviews);
      await AsyncStorage.setItem('reviews', JSON.stringify(updatedReviews));

      // Update location average rating
      const locationReviews = updatedReviews.filter(r => r.locationId === reviewData.locationId);
      const averageRating = locationReviews.reduce((sum, r) => sum + r.rating, 0) / locationReviews.length;
      
      const updatedLocations = locations.map(location =>
        location.id === reviewData.locationId
          ? { ...location, averageRating, totalReviews: locationReviews.length }
          : location
      );
      
      setLocations(updatedLocations);
      await AsyncStorage.setItem('locations', JSON.stringify(updatedLocations));
    } catch (error) {
      console.error('Error adding review:', error);
    }
  };

  const addLocation = async (locationData: Omit<Location, 'id'>) => {
    try {
      const newLocation: Location = {
        id: Date.now().toString(),
        ...locationData,
      };

      const updatedLocations = [...locations, newLocation];
      setLocations(updatedLocations);
      await AsyncStorage.setItem('locations', JSON.stringify(updatedLocations));
    } catch (error) {
      console.error('Error adding location:', error);
      throw error;
    }
  };

  const getRecentReviews = (): Review[] => {
    return reviews
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  };

  return {
    locations,
    reviews,
    isLoading,
    searchLocations,
    getLocationById,
    getLocationReviews,
    addReview,
    addLocation,
    getRecentReviews,
  };
});