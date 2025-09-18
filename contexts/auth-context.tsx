import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export const [AuthProvider, useAuth] = createContextHook((): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData && userData.trim() && userData !== 'undefined' && userData !== 'null' && !userData.startsWith('[object') && !userData.startsWith('object Object')) {
        try {
          const parsedUser = JSON.parse(userData);
          if (parsedUser && typeof parsedUser === 'object' && parsedUser.id) {
            setUser(parsedUser);
          } else {
            console.warn('Invalid user data structure, clearing storage');
            await AsyncStorage.removeItem('user');
          }
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          console.log('Corrupted user data:', userData);
          await AsyncStorage.removeItem('user');
        }
      } else if (userData) {
        console.warn('Detected corrupted user data, clearing:', userData.substring(0, 50));
        await AsyncStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Error loading user:', error);
      // Clear potentially corrupted data
      try {
        await AsyncStorage.removeItem('user');
      } catch (clearError) {
        console.error('Error clearing user data:', clearError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Mock authentication - in real app, this would call an API
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        joinedDate: new Date().toISOString(),
        bio: 'Explorer of cities and hidden gems',
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      // Mock registration - in real app, this would call an API
      const mockUser: User = {
        id: Date.now().toString(),
        email,
        name,
        joinedDate: new Date().toISOString(),
        bio: 'New to CitySync!',
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
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

  return {
    user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };
});