import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

// Context creation function
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  try {
    // Extract user ID from headers
    const userId = opts.req.headers.get('x-user-id');
    console.log('Creating context with user ID:', userId);
    console.log('All headers:', Object.fromEntries(opts.req.headers.entries()));
    
    if (!userId || userId === 'anonymous-user') {
      console.log('No valid user ID found, creating anonymous context');
      return {
        req: opts.req,
        user: null,
      };
    }
    
    // For now, we'll trust the user ID from headers since we're using Firebase Auth on the client
    // In production, you should verify the Firebase ID token here
    console.log('Creating authenticated context for user:', userId);
    return {
      req: opts.req,
      user: { id: userId },
    };
  } catch (error) {
    console.error('Error creating context:', error);
    return {
      req: opts.req,
      user: null,
    };
  }
};

export type Context = Awaited<ReturnType<typeof createContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// Protected procedure that requires authentication
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  console.log('Protected procedure middleware called with ctx.user:', ctx.user);
  if (!ctx.user || !ctx.user.id) {
    console.log('Authentication failed - no user or user ID');
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  console.log('Authentication successful for user:', ctx.user.id);
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Debug: Log that tRPC is initialized
console.log('tRPC initialized with context and procedures');