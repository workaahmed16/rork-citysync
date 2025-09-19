import { createTRPCRouter, publicProcedure } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { updateProfileProcedure, getProfileProcedure, simpleGetProfileProcedure } from "./routes/user/profile/route";

// Debug procedure to test router mounting
const debugProcedure = publicProcedure.query(() => {
  console.log('Debug procedure called - router is working!');
  return {
    message: 'tRPC router is working correctly',
    timestamp: new Date().toISOString(),
    routes: {
      'example.hi': 'available',
      'user.getProfile': 'available (protected)',
      'user.updateProfile': 'available (protected)',
      'debug': 'available (public)'
    }
  };
});

// Simple test procedure to verify the issue
const testGetProfileProcedure = publicProcedure.query(() => {
  console.log('Test getProfile procedure called');
  return { message: 'Test getProfile working', timestamp: new Date().toISOString() };
});

// Create nested routers first
const exampleRouter = createTRPCRouter({
  hi: hiRoute,
});

const userRouter = createTRPCRouter({
  updateProfile: updateProfileProcedure,
  getProfile: getProfileProcedure,
  testGetProfile: testGetProfileProcedure,
  simpleGetProfile: simpleGetProfileProcedure,
});

// Main app router
export const appRouter = createTRPCRouter({
  debug: debugProcedure,
  example: exampleRouter,
  user: userRouter,
});

// Debug: Log the router structure
console.log('tRPC Router initialized with procedures:');
console.log('- debug: available');
console.log('- example.hi: available');
console.log('- user.getProfile: available');
console.log('- user.updateProfile: available');
console.log('Router type:', typeof appRouter);
console.log('Router keys:', Object.keys(appRouter._def.procedures || {}));

export type AppRouter = typeof appRouter;