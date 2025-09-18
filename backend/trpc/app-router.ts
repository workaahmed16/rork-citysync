import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { updateProfileProcedure, getProfileProcedure } from "./routes/user/profile/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  user: createTRPCRouter({
    updateProfile: updateProfileProcedure,
    getProfile: getProfileProcedure,
  }),
});

export type AppRouter = typeof appRouter;