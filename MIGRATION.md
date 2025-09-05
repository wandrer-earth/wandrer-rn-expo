# Migration Plan: Wandrer React Native to Expo

## Overview
This document outlines the plan to migrate the existing `wandrer-react-native` project to this new Expo SDK 53 project. **MapLibre integration is prioritized as Phase 1** since it's the biggest project dependency and must be working before other features can be built.

## Phase 1: MapLibre Integration (PRIORITY)

MapLibre React Native now supports Expo! 🎉 **This is our first priority since map rendering is critical to the entire application.**

**Setup Steps:**
1. Install `@maplibre/maplibre-react-native`
2. Configure the Expo config plugin in `app.json`
3. Create basic map component to verify rendering works
4. Test on development client (iOS/Android)
5. No native code changes needed - the plugin handles everything

**Configuration:**
```json
{
  "expo": {
    "plugins": [
      [
        "@maplibre/maplibre-react-native",
      ]
    ]
  }
}
```

**Success Criteria:**
- Map renders on iOS development client
- Map renders on Android development client
- Basic map interactions work (pan, zoom)
- Ready for core app features to be built on top

## Phase 2: Core Dependencies Installation

### Keep Compatible Packages (Install First)
- **MapLibre GL Native** - `@maplibre/maplibre-react-native` (✅ Already done in Phase 1!)
- **Modern State Management**:
  - `zustand` - Simple state management for client state
  - `@tanstack/react-query` - Server state management and caching
  - `@tanstack/react-query-persist-client` - Offline persistence
- **HTTP Client**:
  - `axios` - **Recommended** for React Native compatibility, interceptors, and file uploads
- Navigation (@react-navigation/*)
- UI libraries (native-base, react-native-elements, react-native-vector-icons)
- Turf.js libraries for geospatial operations
- Most React Native community packages

### Replace Incompatible Packages with Expo Alternatives
- `react-native-splash-screen` → `expo-splash-screen`
- `react-native-branch` → `expo-linking` + Branch SDK
- `react-native-onesignal` → `expo-notifications` or OneSignal Expo plugin
- `react-native-permissions` → `expo-location`, `expo-camera`, etc.
- `react-native-fs` → `expo-file-system`
- `react-native-geolocation-service` → `expo-location`
- `react-native-keep-awake` → `expo-keep-awake`
- `react-native-push-notification` → `expo-notifications`
- `react-native-localize` → `expo-localization`

## Phase 3: State Management Architecture Setup

### Modern Architecture Overview
**Client State (Zustand)**: UI state, user preferences, temporary data
**Server State (React Query)**: API data, caching, synchronization

### Store Migration Map
- `users` Redux store → `useUserStore` (Zustand)
- `rides` Redux store → `useRideStore` (Zustand) 
- `mapSettings` Redux store → `useMapSettingsStore` (Zustand)
- `leaderboard` Redux store → `useLeaderboard` (React Query)
- `arenas` Redux store → `useArenas` (React Query)

### API Migration Map
- `fetchLeaderboard` saga → `useLeaderboard` query
- `saveRide` saga → `useSaveRide` mutation
- `syncActivities` saga → `useActivities` query
- `uploadGPX` saga → `useUploadGPX` mutation

1. **Set up Axios API client**
   - Configure base URL and timeouts
   - Add authentication interceptors
   - Set up token refresh logic
   - Configure file upload support for GPX files

2. **Set up React Query client**
   - Configure query client with offline support
   - Set up error handling and retry logic
   - Add persistence for offline usage
   - Integrate with Axios for API calls

3. **Create core Zustand stores**
   - User authentication store
   - Ride tracking store
   - Map settings store

## Phase 4: Basic App Structure & Map Integration

1. **Copy core map components** from source (`/src/components/map/`)
   - MapView component
   - Map-related utilities
   - Geospatial helpers

2. **Update App.tsx**
   - Add React Query Provider
   - Set up basic map rendering to verify everything works
   - Initialize core Zustand stores
   - Test map renders before adding other features

## Phase 5: Source Code Migration

1. **Copy and transform source structure** (`/src` folder)
   - All components (activity, dashboard, settings, etc.)
   - **Convert Redux stores to Zustand stores**
   - **Convert sagas to React Query hooks**
   - Services and utilities (migrate to Axios-based API client)
   - Assets and styles
   - Update existing hooks and contexts

2. **Update entry point**
   - Integrate full Splash.js logic
   - Set up React Query Provider and Navigation
   - Initialize Zustand stores
   - Update imports for Expo packages

## Phase 6: Native Module Replacements

### Location Services
- Replace `react-native-geolocation-service` with `expo-location`
- Update permission handling

### File System
- Replace `react-native-fs` with `expo-file-system`
- Update file operations for GPX exports

### Push Notifications
- Implement `expo-notifications`
- Configure OneSignal if needed via config plugin

### Splash Screen
- Use `expo-splash-screen` instead of `react-native-splash-screen`

## Phase 7: Configuration & Build

### Update app.json
- Add iOS bundle identifier: `com.wandrer.app`
- Configure permissions (location, notifications)
- Add splash screen configuration
- Set up app icons

### Configure EAS Build
- Add custom native dependencies via plugins
- Configure development and production builds

## Phase 8: Testing & Optimization

1. Test all migrated features
2. Verify map functionality
3. Test location tracking
4. Verify push notifications
5. Test file operations (GPX export)
6. Performance optimization

## Key Challenges

- **MapLibre GL Native** - ✅ **Resolved!** Now has official Expo support
- **OneSignal** - May need custom config plugin
- **Branch deep linking** - Needs proper Expo configuration

## Recommended Approach

Start with Phase 1-2 to get the core app running, then tackle native modules one by one. **MapLibre integration is now much simpler** with official Expo support, so this is no longer the biggest blocker!

## Current Project Structure (Source)

```
wandrer-react-native/
├── src/
│   ├── assets/           # Images, icons, etc.
│   ├── components/       # UI components
│   │   ├── activity/
│   │   ├── dashboard/
│   │   ├── map/         # MapLibre integration
│   │   ├── settings/
│   │   └── ...
│   ├── hooks/
│   ├── sagas/           # Redux-saga logic → MIGRATE TO React Query
│   ├── services/        # API calls
│   ├── stores/          # Redux stores → MIGRATE TO Zustand
│   ├── utils/
│   ├── Navigator.js     # Navigation setup
│   └── Splash.js        # App entry point
├── ios/                 # Native iOS code
├── android/             # Native Android code
└── package.json         # Dependencies
```

## Target Project Structure (Modern Architecture)

```
wandrer-rn-expo/
├── src/
│   ├── assets/           # Images, icons, etc.
│   ├── components/       # UI components
│   │   ├── activity/
│   │   ├── dashboard/
│   │   ├── map/         # MapLibre integration
│   │   ├── settings/
│   │   └── ...
│   ├── hooks/
│   │   ├── api/         # React Query hooks (replaces sagas)
│   │   └── stores/      # Custom Zustand hooks
│   ├── services/        # API clients (axios/ky)
│   ├── stores/          # Zustand stores (replaces Redux)
│   ├── utils/
│   ├── types/           # TypeScript definitions
│   ├── Navigator.tsx    # Navigation setup
│   └── providers/       # React Query & other providers
├── assets/             # App icons, splash screens
├── App.tsx             # Main entry point
├── app.json            # Expo configuration
├── eas.json            # EAS Build configuration
└── package.json        # Expo dependencies
```

## API Client Architecture

### Why Axios?
- **React Native Compatibility**: Proven track record with FormData and file uploads
- **GPX File Uploads**: Built-in upload progress tracking for ride data
- **Authentication**: Powerful interceptors for token management
- **React Query Integration**: Seamless integration with excellent documentation
- **Error Handling**: Comprehensive request/response interceptors

### Axios Setup

```typescript
// services/api.ts
import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import { useAuthStore } from '../stores/authStore'

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add auth token
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        await useAuthStore.getState().refreshToken()
        const newToken = await SecureStore.getItemAsync('token')
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api.request(originalRequest)
      } catch (refreshError) {
        useAuthStore.getState().logout()
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

// GPX file upload with progress tracking
export const uploadGPX = (
  file: any, 
  onProgress?: (percent: number) => void
) => {
  const formData = new FormData()
  formData.append('gpx', {
    uri: file.uri,
    type: 'application/gpx+xml',
    name: file.name || 'ride.gpx',
  } as any)
  
  return api.post('/rides/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        onProgress(percent)
      }
    },
  })
}

export default api
```

## Implementation Examples

### 1. Zustand Store Example (Ride Tracking)

```typescript
// stores/rideStore.ts
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import * as Location from 'expo-location'

interface RideStore {
  currentRide: Ride | null
  isTracking: boolean
  locations: LocationPoint[]
  startTracking: () => Promise<void>
  stopTracking: () => Promise<void>
  addLocation: (location: LocationPoint) => void
}

export const useRideStore = create<RideStore>()()
  subscribeWithSelector((set, get) => ({
    currentRide: null,
    isTracking: false,
    locations: [],

    startTracking: async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') return

      set({
        isTracking: true,
        currentRide: createNewRide(),
        locations: []
      })

      await Location.startLocationUpdatesAsync(LOCATION_TASK, {
        accuracy: Location.Accuracy.High,
        distanceInterval: 10,
        foregroundService: {
          notificationTitle: "Tracking your ride",
        }
      })
    },

    stopTracking: async () => {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK)
      set({ isTracking: false })
    },

    addLocation: (location) => {
      set((state) => ({
        locations: [...state.locations, location]
      }))
    }
  }))
```

### 2. React Query Hook Example (API)

```typescript
// hooks/api/useLeaderboard.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'

export const useLeaderboard = (arenaId: string) => {
  return useQuery({
    queryKey: ['leaderboard', arenaId],
    queryFn: () => api.get(`/leaderboards/${arenaId}`),
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => transformLeaderboardData(data),
    enabled: !!arenaId
  })
}

export const useSaveRide = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (ride: RideData) => api.post('/rides', ride),
    onSuccess: () => {
      // Invalidate and refetch ride queries
      queryClient.invalidateQueries({ queryKey: ['rides'] })
    },
    // Optimistic updates
    onMutate: async (newRide) => {
      await queryClient.cancelQueries({ queryKey: ['rides'] })
      const previousRides = queryClient.getQueryData(['rides'])
      queryClient.setQueryData(['rides'], (old) => [...old, newRide])
      return { previousRides }
    },
    onError: (err, newRide, context) => {
      queryClient.setQueryData(['rides'], context.previousRides)
    }
  })
}

// GPX upload with progress
export const useUploadGPX = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ file, onProgress }: { 
      file: any, 
      onProgress?: (percent: number) => void 
    }) => uploadGPX(file, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rides'] })
    }
  })
}
```

### 3. Authentication Flow

```typescript
// stores/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as SecureStore from 'expo-secure-store'
import api from '../services/api'

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()()
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (credentials) => {
        const response = await api.post('/auth/login', credentials)
        await SecureStore.setItemAsync('token', response.token)
        await SecureStore.setItemAsync('refreshToken', response.refreshToken)
        set({ 
          user: response.user, 
          isAuthenticated: true 
        })
      },

      logout: async () => {
        await SecureStore.deleteItemAsync('token')
        await SecureStore.deleteItemAsync('refreshToken')
        set({ user: null, isAuthenticated: false })
      },

      refreshToken: async () => {
        try {
          const refreshToken = await SecureStore.getItemAsync('refreshToken')
          if (!refreshToken) throw new Error('No refresh token')
          
          const response = await api.post('/auth/refresh', { refreshToken })
          await SecureStore.setItemAsync('token', response.token)
          
          if (response.user) {
            set({ user: response.user, isAuthenticated: true })
          }
        } catch (error) {
          // Refresh failed, logout user
          get().logout()
          throw error
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
```

## Benefits of This Modern Architecture

### Zustand Benefits
- **Simpler**: No boilerplate, direct state updates
- **TypeScript-first**: Excellent type inference
- **Smaller bundle**: ~2KB vs Redux's ~19KB
- **No providers needed**: Works anywhere in the app
- **DevTools support**: Redux DevTools integration

### React Query Benefits  
- **Automatic caching**: Intelligent background refetching
- **Offline support**: Built-in persistence and sync
- **Optimistic updates**: Better UX with instant feedback
- **Error handling**: Retry logic and error boundaries
- **Background sync**: Automatic data synchronization
- **Request deduplication**: Prevents duplicate API calls