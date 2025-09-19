# tRPC Connectivity Fix Summary

## Issues Fixed

### 1. Backend Configuration (backend/hono.ts)
- **Fixed CORS configuration**: Updated to allow all origins and proper headers for mobile development
- **Fixed tRPC endpoint**: Changed from `/api/trpc` to `/trpc` to match the mount path
- **Added health check endpoint**: Added `/api/health` for debugging connectivity

### 2. Frontend tRPC Client (lib/trpc.ts)
- **Platform-specific base URLs**: 
  - Web: `http://localhost:3000`
  - iOS: `http://localhost:3000` 
  - Android: `http://10.0.2.2:3000` (Android emulator requires this IP)
- **Enhanced error handling**: Added detailed logging for requests and responses
- **Improved headers**: Added proper Content-Type headers and auth headers

### 3. Backend Test Page (app/backend-test.tsx)
- **Added health check test**: Simple connectivity test before tRPC
- **Fixed tRPC usage**: Changed from React hooks to direct client calls
- **Enhanced debugging**: Added detailed logging for all operations

### 4. Environment Configuration (.env)
- **Created .env file**: Template for production environment variables
- **Documentation**: Clear instructions for production deployment

## Key Changes Made

### Backend (backend/hono.ts)
```typescript
// CORS configuration for mobile development
app.use("*", cors({
  origin: '*',
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-trpc-source'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Fixed tRPC endpoint
app.use("/trpc/*", trpcServer({
  endpoint: "/trpc", // Changed from "/api/trpc"
  router: appRouter,
  createContext,
}));
```

### Frontend (lib/trpc.ts)
```typescript
const getBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'web') return 'http://localhost:3000';
    if (Platform.OS === 'ios') return 'http://localhost:3000';
    if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
  }
  // Production logic...
};
```

## Testing Instructions

1. **Start the backend**: Make sure your Hono server is running on port 3000
2. **Open the app**: Navigate to `/backend-test` in your app
3. **Test connectivity**:
   - First, test "Backend Health Check" - should connect to `/api/health`
   - Then test "tRPC Test" - should call the tRPC endpoint
   - Finally test profile operations after logging in

## Platform-Specific Notes

### Web Development
- Uses `http://localhost:3000` directly
- Should work immediately if backend is running

### iOS Simulator
- Uses `http://localhost:3000`
- iOS simulator can access localhost directly

### Android Emulator
- Uses `http://10.0.2.2:3000`
- Android emulator maps `10.0.2.2` to the host machine's localhost

### Real Devices
- For real devices, you'll need to:
  1. Find your computer's IP address on the local network
  2. Set `EXPO_PUBLIC_RORK_API_BASE_URL=http://YOUR_IP:3000` in .env
  3. Make sure your backend accepts connections from that IP

## Production Deployment

For production, set the environment variable:
```bash
EXPO_PUBLIC_RORK_API_BASE_URL=https://your-production-backend.com
```

## Common Issues & Solutions

### "Failed to fetch" Error
- Check if backend is running on port 3000
- Verify the correct IP address for your platform
- Check firewall settings

### "JSON parse error: unexpected character: <"
- Usually means the backend returned HTML instead of JSON
- Check if the endpoint exists and returns proper JSON
- Verify CORS configuration

### Profile Updates Not Working
- Ensure user is logged in (Firebase Auth)
- Check that `x-user-id` header is being sent
- Verify Firestore permissions and configuration

## Files Modified

1. `backend/hono.ts` - Backend server configuration
2. `lib/trpc.ts` - tRPC client configuration  
3. `app/backend-test.tsx` - Testing interface
4. `backend/trpc/routes/example/hi/route.ts` - Example route fix
5. `.env` - Environment configuration template

All changes maintain backward compatibility and include proper error handling and logging for debugging.