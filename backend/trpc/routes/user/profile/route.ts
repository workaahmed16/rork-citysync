import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const profileSchema = z.object({
  name: z.string().optional(),
  photo: z.string().optional(),
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
    const userRef = doc(db, 'users', userId);
    
    try {
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        await updateDoc(userRef, {
          ...input,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await setDoc(userRef, {
          ...input,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      
      return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error('Failed to update profile');
    }
  });

export const getProfileProcedure = protectedProcedure
  .query(async ({ ctx }: { ctx: any }) => {
    const userId = ctx.user.id;
    const userRef = doc(db, 'users', userId);
    
    try {
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting profile:', error);
      throw new Error('Failed to get profile');
    }
  });