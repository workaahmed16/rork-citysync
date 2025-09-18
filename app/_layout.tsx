import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider } from "@/contexts/auth-context";
import { LocationsProvider } from "@/contexts/locations-context";
import { LocationPermissionProvider } from "@/contexts/location-permission-context";
import { trpc, trpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ presentation: "modal" }} />
      <Stack.Screen name="auth/register" options={{ presentation: "modal" }} />
      <Stack.Screen name="location/[id]" />
      <Stack.Screen name="add-review" options={{ presentation: "modal" }} />
      <Stack.Screen name="edit-profile" options={{ presentation: "modal" }} />
      <Stack.Screen name="backend-test" options={{ title: "Backend Test" }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Clear any potentially corrupted AsyncStorage data on startup
        const keys = await AsyncStorage.getAllKeys();
        const corruptedKeys = [];
        
        for (const key of keys) {
          try {
            const value = await AsyncStorage.getItem(key);
            if (value && (value === 'undefined' || value === 'null' || value === 'object Object' || value.startsWith('[object'))) {
              corruptedKeys.push(key);
            }
          } catch (error) {
            corruptedKeys.push(key);
          }
        }
        
        if (corruptedKeys.length > 0) {
          console.log('Clearing corrupted AsyncStorage keys:', corruptedKeys);
          await AsyncStorage.multiRemove(corruptedKeys);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        SplashScreen.hideAsync();
      }
    };
    
    initializeApp();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LocationPermissionProvider>
            <LocationsProvider>
              <GestureHandlerRootView style={styles.container}>
                <RootLayoutNav />
              </GestureHandlerRootView>
            </LocationsProvider>
          </LocationPermissionProvider>
        </AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});