# Migration Plan: Wandrer React Native to Expo

## Overview
This document outlines the plan to migrate the existing `wandrer-react-native` project to this new Expo SDK 53 project. **This migration is currently IN PROGRESS with significant components completed.**

## COMPLETED PHASES

### Phase 1: MapLibre Integration (COMPLETED)

MapLibre React Native now supports Expo!

**Completed Setup Steps:**
1. - [x] Install `@maplibre/maplibre-react-native` - **DONE**
2. - [x] Configure the Expo config plugin in `app.json` - **DONE**
3. - [x] Create basic map component to verify rendering works - **DONE** (`src/components/map/MapView.tsx`)
4. - [x] Test on development client (iOS/Android) - **DONE**
5. - [x] No native code changes needed - the plugin handles everything - **DONE**

**Current Configuration:**
```json
{
  "expo": {
    "plugins": [
      "@maplibre/maplibre-react-native"
    ]
  }
}
```

**Success Criteria Met:**
- [x] Map renders on iOS development client
- [x] Map renders on Android development client  
- [x] Basic map interactions work (pan, zoom)
- [x] Ready for core app features to be built on top

### Phase 2: Core Dependencies Installation (COMPLETED)

**Installed Compatible Packages:**
- [x] **MapLibre GL Native** - `@maplibre/maplibre-react-native` 
- [x] **Modern State Management**:
  - [x] `zustand` - Simple state management for client state
  - [x] `@tanstack/react-query` - Server state management and caching
  - [x] `@tanstack/react-query-persist-client` - Offline persistence
- [x] **HTTP Client**:
  - [x] `axios` - For React Native compatibility, interceptors, and file uploads
- [x] **Navigation** - `@react-navigation/*` packages
- [x] **UI libraries** - `react-native-elements`, `react-native-vector-icons`
- [x] **Storage** - `@react-native-async-storage/async-storage`, `expo-secure-store`

### Phase 3: State Management Architecture Setup (COMPLETED)

**Modern Architecture Implemented:**
- [x] **Client State (Zustand)**: Implemented in `src/stores/authStore.ts`
- [x] **Server State (React Query)**: Provider setup in `src/providers/QueryProvider.tsx`

**Core Infrastructure Created:**
- [x] **Axios API client** - `src/services/api.ts` with interceptors and auth handling
- [x] **React Query client** - Configured with offline support and error handling
- [x] **Authentication store** - `src/stores/authStore.ts` with Zustand
- [x] **API hooks** - `src/hooks/api/useAuth.ts`

### Phase 4: Basic App Structure & Map Integration (COMPLETED)

**App Structure Created:**
- [x] **Core navigation** - `src/navigation/AppNavigator.tsx`
- [x] **Map component** - `src/components/map/MapView.tsx` with MapLibre integration
- [x] **Authentication screens** - LoginScreen, OnboardingScreen
- [x] **App.tsx** updated with React Query Provider
- [x] **Basic app renders and navigates correctly**

## CURRENT STATUS: WORKING APP WITH AUTHENTICATION

**Current State (as of latest commits):**
- [x] App launches and renders correctly
- [x] MapLibre integration working
- [x] Authentication system functional with real API calls
- [x] Zustand + React Query architecture implemented
- [x] Navigation between screens working
- [x] Onboarding flow implemented
- [ ] **Currently debugging authentication flow refinements**

## NEXT PHASES (REMAINING WORK)

### Phase 5: Enhanced Map Features (IMMEDIATE PRIORITY)

**Current Issue:** Map shows placeholder demo tiles instead of real map data

**PENDING Tasks:**
1. **Replace demo map tiles with production tiles**
   - [ ] Set up MapTiler or Mapbox account for tile service
   - [ ] Configure proper style URL in MapView component
   - [ ] Remove demo style: `"https://demotiles.maplibre.org/style.json"`

2. **Implement map layer management system**
   - [ ] Create map layer toggle controls
   - [ ] Add satellite/terrain/street view options
   - [ ] Implement layer visibility state management

3. **Load user's actual ride data on map**
   - [ ] Fetch user's ride history from API
   - [ ] Render GPX tracks as map routes
   - [ ] Show ride statistics and markers

4. **Add user location and tracking**
   - [ ] Implement location permissions with `expo-location`
   - [ ] Show user's current position on map
   - [ ] Center map on user location
   - [ ] Add location following mode

5. **Enhanced map interactions**
   - [ ] Custom map markers for ride endpoints
   - [ ] Route popups with ride details
   - [ ] Map clustering for dense ride areas
   - [ ] Offline map support

### Phase 6: Core App Components (AFTER MAP)

**PENDING Tasks:**
1. **Copy and transform source structure** from `wandrer-react-native/src`
   - [ ] Copy dashboard/home components
   - [ ] Copy ride tracking components  
   - [ ] Copy settings screens
   - [ ] Copy user profile components
   - [ ] Update services and utilities for Axios-based API client
   - [ ] Copy assets and styles

2. **Convert remaining Redux stores to Zustand stores**
   - [ ] `rides` Redux store → `useRideStore` (Zustand)
   - [ ] `mapSettings` Redux store → `useMapSettingsStore` (Zustand)

3. **Convert Redux-sagas to React Query hooks**
   - [ ] `saveRide` saga → `useSaveRide` mutation
   - [ ] `syncActivities` saga → `useActivities` query
   - [ ] `uploadGPX` saga → `useUploadGPX` mutation

### Phase 7: Native Module Replacements

**PENDING Expo Replacements:**
- [ ] **Location Services**: `react-native-geolocation-service` → `expo-location`
- [ ] **File System**: `react-native-fs` → `expo-file-system` 
- [ ] **Push Notifications**: `react-native-push-notification` → `expo-notifications`
- [ ] **Splash Screen**: `react-native-splash-screen` → `expo-splash-screen`
- [ ] **Deep Linking**: `react-native-branch` → `expo-linking`

### Phase 8: Testing & Optimization

**PENDING Tasks:**
- [ ] Test all migrated features
- [ ] Verify map functionality with real data
- [ ] Test location tracking  
- [ ] Test file operations (GPX export)
- [ ] Performance optimization
- [ ] Production build testing

## IMMEDIATE NEXT STEPS

**Priority actions for map enhancement:**
1. **Set up production map tiles** (MapTiler/Mapbox)
2. **Create map layer management system**
3. **Implement user location tracking**
4. **Load and display user's ride history**

---

## MIGRATION PROGRESS SUMMARY

### **COMPLETED (Phases 1-4):**
- [x] Core project setup with Expo SDK 53
- [x] MapLibre integration and basic map rendering  
- [x] Modern state management architecture (Zustand + React Query)
- [x] Authentication system with real API integration
- [x] Basic navigation and screen structure
- [x] Development environment and tooling

### **IN PROGRESS:**
- [ ] Authentication flow refinements and testing

### **TODO (Phases 5-8):**
- [ ] Enhanced map features with real tiles and layer management
- [ ] User location tracking and ride data visualization
- [ ] Source code migration from original project
- [ ] Native module replacements with Expo alternatives  
- [ ] Testing and production optimization

### **Current Priority:** 
**Phase 5 - Enhanced Map Features** to replace placeholder map with real tiles and implement layer management.

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
// hooks/api/useRides.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'

export const useRides = (athleteId?: string) => {
  return useQuery({
    queryKey: ['rides', athleteId],
    queryFn: () => api.get(`/api/v1/athletes/${athleteId}/rides`),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!athleteId
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