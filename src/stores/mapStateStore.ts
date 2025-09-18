import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { debounce } from 'lodash'

export interface MapRegion {
  centerCoordinate: [number, number]
  zoomLevel: number
}

export interface MapStateData {
  centerCoordinate: [number, number]
  zoomLevel: number
  mapMode: number // 0 = normal, 1 = satellite
  lastUpdated: number
  isUserPositioned: boolean // true if user manually positioned map
  lastKnownUserLocation?: [number, number] // Store user's actual location
}

export interface MapPreferences {
  alwaysStartAtCurrentLocation: boolean
  saveMapPosition: boolean
  maxStateAgeDays: number
}

interface MapStateStore extends MapStateData {
  isInitialized: boolean
  preferences: MapPreferences
  
  setMapRegion: (region: MapRegion, isUserInteraction: boolean) => void
  setMapMode: (mode: number) => void
  setUserLocation: (location: [number, number]) => void
  resetToUserLocation: () => void
  clearSavedState: () => void
  getStalenessInHours: () => number
  isStateStale: (hoursThreshold?: number) => boolean
  getDistanceFromUserLocation: () => number | null
  setPreferences: (prefs: Partial<MapPreferences>) => void
}

const DEFAULT_COORDINATE: [number, number] = [-122.4194, 37.7749] // San Francisco
const DEFAULT_ZOOM = 10
const STALE_STATE_HOURS = 24 * 7 // 7 days
const DEBOUNCE_DELAY = 500 // ms

const DEFAULT_PREFERENCES: MapPreferences = {
  alwaysStartAtCurrentLocation: false,
  saveMapPosition: true,
  maxStateAgeDays: 7,
}

// Calculate distance between two coordinates in km
const calculateDistance = (coord1: [number, number], coord2: [number, number]): number => {
  const R = 6371 // Earth's radius in km
  const dLat = (coord2[1] - coord1[1]) * Math.PI / 180
  const dLon = (coord2[0] - coord1[0]) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export const useMapStateStore = create<MapStateStore>()(
  persist(
    (set, get) => {
      // Create debounced save function
      const debouncedSave = debounce((updates: Partial<MapStateData>) => {
        set(updates)
      }, DEBOUNCE_DELAY)

      return {
        centerCoordinate: DEFAULT_COORDINATE,
        zoomLevel: DEFAULT_ZOOM,
        mapMode: 1, // Default to satellite
        lastUpdated: Date.now(),
        isUserPositioned: false,
        isInitialized: false,
        lastKnownUserLocation: undefined,
        preferences: DEFAULT_PREFERENCES,

        setMapRegion: (region, isUserInteraction) => {
          const { saveMapPosition } = get().preferences
          
          if (!saveMapPosition) return
          
          const updates = {
            centerCoordinate: region.centerCoordinate,
            zoomLevel: region.zoomLevel,
            lastUpdated: Date.now(),
            isUserPositioned: isUserInteraction,
          }
          
          if (isUserInteraction) {
            // Save immediately for user interactions
            set(updates)
          } else {
            // Debounce programmatic changes
            debouncedSave(updates)
          }
        },

        setMapMode: (mode) => set({ 
          mapMode: mode, 
          lastUpdated: Date.now() 
        }),

        setUserLocation: (location) => set({ 
          lastKnownUserLocation: location 
        }),

        resetToUserLocation: () => {
          const state = get()
          if (state.lastKnownUserLocation) {
            set({
              centerCoordinate: state.lastKnownUserLocation,
              zoomLevel: Math.max(state.zoomLevel, 12),
              lastUpdated: Date.now(),
              isUserPositioned: false,
            })
          }
        },

        clearSavedState: () => set({
          centerCoordinate: DEFAULT_COORDINATE,
          zoomLevel: DEFAULT_ZOOM,
          mapMode: 1,
          lastUpdated: Date.now(),
          isUserPositioned: false,
          lastKnownUserLocation: undefined,
        }),

        getStalenessInHours: () => {
          const state = get()
          const hoursSinceUpdate = (Date.now() - state.lastUpdated) / (1000 * 60 * 60)
          return hoursSinceUpdate
        },

        isStateStale: (hoursThreshold?: number) => {
          const { maxStateAgeDays } = get().preferences
          const threshold = hoursThreshold || (maxStateAgeDays * 24)
          const hoursSinceUpdate = get().getStalenessInHours()
          return hoursSinceUpdate > threshold
        },

        getDistanceFromUserLocation: () => {
          const state = get()
          if (!state.lastKnownUserLocation) return null
          return calculateDistance(state.centerCoordinate, state.lastKnownUserLocation)
        },

        setPreferences: (prefs) => set(state => ({
          preferences: { ...state.preferences, ...prefs }
        })),
      }
    },
    {
      name: 'map-state',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        centerCoordinate: state.centerCoordinate,
        zoomLevel: state.zoomLevel,
        mapMode: state.mapMode,
        lastUpdated: state.lastUpdated,
        isUserPositioned: state.isUserPositioned,
        lastKnownUserLocation: state.lastKnownUserLocation,
        preferences: state.preferences,
      }),
      onRehydrateStorage: () => (state) => {
        // Mark as initialized after rehydration
        state?.setInitialized?.(true)
      },
    }
  )
)

// Add setInitialized method after store creation
useMapStateStore.setState({ 
  setInitialized: (value: boolean) => useMapStateStore.setState({ isInitialized: value }) 
})