import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

// app will be mounted at /api
const app = new Hono();

// Enable CORS for all routes with specific configuration for mobile development
app.use("*", cors({
  origin: '*', // Allow all origins for development
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-trpc-source'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Global error handler
app.onError((err, c) => {
  console.error('Hono error:', err);
  return c.json(
    { 
      error: 'Internal Server Error', 
      message: err.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    }, 
    500
  );
});

// Add debugging middleware to log all requests
app.use('*', async (c, next) => {
  console.log(`${c.req.method} ${c.req.url}`);
  console.log('Headers:', Object.fromEntries(c.req.raw.headers.entries()));
  await next();
});

// Mount tRPC router at /trpc
app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/trpc",
    router: appRouter,
    createContext,
    onError: ({ error, path }) => {
      console.error('tRPC error on path:', path, 'Error:', error);
      console.error('Full error details:', error);
    },
  })
);

// Simple health check endpoint
app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running", timestamp: new Date().toISOString() });
});

// Health check endpoint for debugging
app.get("/health", (c) => {
  return c.json({ 
    status: "healthy", 
    message: "Backend is running correctly", 
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', message: 'The requested resource was not found' }, 404);
});

export default app;