import { createTRPCRouter, publicProcedure } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { updateProfileProcedure, getProfileProcedure } from "./routes/user/profile/route";

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

export const appRouter = createTRPCRouter({
  debug: debugProcedure,
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  user: createTRPCRouter({
    updateProfile: updateProfileProcedure,
    getProfile: getProfileProcedure,
  }),
});

export type AppRouter = typeof appRouter;