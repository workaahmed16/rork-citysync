import { z } from 'zod';
import { protectedProcedure, publicProcedure } from '@/backend/trpc/create-context';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// Debug: Log that this file is being loaded
console.log('Loading user profile routes...');

// Simple test procedure to verify basic functionality
export const simpleGetProfileProcedure = publicProcedure.query(() => {
  console.log('Simple getProfile procedure called');
  return { message: 'Simple getProfile working', data: { name: 'Test User', bio: 'Test Bio' } };
});

const profileSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  photo: z.string().optional(),
  profilePhoto: z.string().optional(),
  hobbies: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
});

export const updateProfileProcedure = protectedProcedure
  .input(profileSchema)
  .mutation(async ({ input, ctx }: { input: z.infer<typeof profileSchema>; ctx: any }) => {
    const userId = ctx.user.id;
    console.log('Updating profile for user:', userId, 'with data:', input);
    
    const userRef = doc(db, 'users', userId);
    
    try {
      // Clean up the input data - remove undefined values
      const cleanInput = Object.fromEntries(
        Object.entries(input).filter(([_, value]) => value !== undefined)
      );
      
      console.log('Clean input data:', cleanInput);
      
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        console.log('Updating existing document');
        await updateDoc(userRef, {
          ...cleanInput,
          updatedAt: new Date().toISOString(),
        });
      } else {
        console.log('Creating new document');
        await setDoc(userRef, {
          ...cleanInput,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      
      console.log('Profile updated successfully for user:', userId);
      return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
      console.error('Error updating profile for user:', userId, error);
      throw new Error(`Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

export const getProfileProcedure = protectedProcedure
  .query(async ({ ctx }: { ctx: any }) => {
    const userId = ctx.user.id;
    console.log('getProfile called for user:', userId);
    const userRef = doc(db, 'users', userId);
    
    try {
      console.log('Fetching user document from Firestore...');
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log('User document found:', data);
        return data;
      } else {
        console.log('No user document found for user:', userId);
        return null;
      }
    } catch (error) {
      console.error('Error getting profile for user:', userId, error);
      throw new Error(`Failed to get profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

// Debug: Log that procedures are created
console.log('User profile procedures created:');
console.log('- updateProfileProcedure:', typeof updateProfileProcedure);
console.log('- getProfileProcedure:', typeof getProfileProcedure);