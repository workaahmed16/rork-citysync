import { createTRPCReact, createTRPCClient } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { auth } from "@/lib/firebase";
import { Platform } from "react-native";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  // Check for environment variable first
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    console.log('Using environment variable base URL:', process.env.EXPO_PUBLIC_RORK_API_BASE_URL);
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  // For development, use different URLs based on platform
  if (__DEV__) {
    let baseUrl: string;
    
    // For web development
    if (Platform.OS === 'web') {
      baseUrl = 'http://localhost:3000';
    }
    // For iOS simulator and Android emulator
    // iOS simulator can use localhost, Android emulator needs 10.0.2.2
    else if (Platform.OS === 'ios') {
      baseUrl = 'http://localhost:3000';
    } else if (Platform.OS === 'android') {
      baseUrl = 'http://10.0.2.2:3000';
    }
    // Fallback for other platforms
    else {
      baseUrl = 'http://localhost:3000';
    }
    
    console.log(`Using development base URL for ${Platform.OS}:`, baseUrl);
    return baseUrl;
  }

  throw new Error(
    "No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL for production"
  );
};

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      headers: async () => {
        try {
          const user = auth.currentUser;
          if (user) {
            return {
              'x-user-id': user.uid,
              'Content-Type': 'application/json',
            };
          }
          return {
            'Content-Type': 'application/json',
          };
        } catch (error) {
          console.error('Error getting auth headers:', error);
          return {
            'Content-Type': 'application/json',
          };
        }
      },
      fetch: async (url, options) => {
        console.log('tRPC request:', url, options?.method || 'GET');
        try {
          const response = await fetch(url, {
            ...options,
            headers: {
              ...options?.headers,
            },
          });
          console.log('tRPC response status:', response.status);
          if (!response.ok) {
            const text = await response.text();
            console.error('tRPC error response:', text);
            throw new Error(`HTTP ${response.status}: ${text}`);
          }
          return response;
        } catch (error) {
          console.error('tRPC fetch error:', error);
          throw error;
        }
      },
    }),
  ],
});