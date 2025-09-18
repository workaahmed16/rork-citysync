import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import type { User } from '@/types';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { trpcClient } from '@/lib/trpc';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const [AuthProvider, useAuth] = createContextHook((): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      if (firebaseUser) {
        await loadUserProfile(firebaseUser.uid);
      } else {
        setUser(null);
        await AsyncStorage.removeItem('user');
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      // First try to load from local storage for faster loading
      const cachedUserData = await AsyncStorage.getItem('user');
      if (cachedUserData && cachedUserData.trim() && cachedUserData !== 'undefined' && cachedUserData !== 'null') {
        try {
          const parsedUser = JSON.parse(cachedUserData);
          if (parsedUser && typeof parsedUser === 'object' && parsedUser.id === userId) {
            setUser(parsedUser);
          }
        } catch (parseError) {
          console.error('Error parsing cached user data:', parseError);
          await AsyncStorage.removeItem('user');
        }
      }

      // Then fetch from backend to ensure data is up to date
      try {
        const profileData = await trpcClient.user.getProfile.query();
        if (profileData) {
          const userProfile: User = {
            id: userId,
            email: firebaseUser?.email || '',
            name: profileData.name || firebaseUser?.email?.split('@')[0] || 'User',
            joinedDate: profileData.createdAt || new Date().toISOString(),
            bio: 'Explorer of cities and hidden gems',
            photo: profileData.photo,
            hobbies: profileData.hobbies || [],
            interests: profileData.interests || [],
            city: profileData.city,
            country: profileData.country,
            location: profileData.location,
          };
          setUser(userProfile);
          await AsyncStorage.setItem('user', JSON.stringify(userProfile));
        } else {
          // Create default profile if none exists
          const defaultProfile: User = {
            id: userId,
            email: firebaseUser?.email || '',
            name: firebaseUser?.email?.split('@')[0] || 'User',
            joinedDate: new Date().toISOString(),
            bio: 'Explorer of cities and hidden gems',
          };
          setUser(defaultProfile);
          await AsyncStorage.setItem('user', JSON.stringify(defaultProfile));
        }
      } catch (backendError) {
        console.error('Error loading profile from backend:', backendError);
        // If backend fails, use cached data or create default
        if (!user) {
          const defaultProfile: User = {
            id: userId,
            email: firebaseUser?.email || '',
            name: firebaseUser?.email?.split('@')[0] || 'User',
            joinedDate: new Date().toISOString(),
            bio: 'Explorer of cities and hidden gems',
          };
          setUser(defaultProfile);
          await AsyncStorage.setItem('user', JSON.stringify(defaultProfile));
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Create initial profile in backend
      try {
        await trpcClient.user.updateProfile.mutate({ name });
      } catch (profileError) {
        console.error('Error creating initial profile:', profileError);
      }
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('user');
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user || !firebaseUser) return;
    
    try {
      // Update in backend first
      await trpcClient.user.updateProfile.mutate({
        name: updates.name,
        photo: updates.photo,
        hobbies: updates.hobbies,
        interests: updates.interests,
        city: updates.city,
        country: updates.country,
        location: updates.location,
      });
      
      // Update local state and storage
      const updatedUser = { ...user, ...updates };
      const userString = JSON.stringify(updatedUser);
      if (userString && userString !== '[object Object]' && userString !== 'undefined') {
        await AsyncStorage.setItem('user', userString);
        setUser(updatedUser);
      } else {
        console.error('Failed to stringify user data:', updatedUser);
        throw new Error('Invalid user data for storage');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (firebaseUser) {
      await loadUserProfile(firebaseUser.uid);
    }
  };

  return {
    user,
    firebaseUser,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    refreshProfile,
  };
});