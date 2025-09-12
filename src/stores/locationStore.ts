import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import * as Location from 'expo-location'

export interface CurrentLocation {
  latitude: number
  longitude: number
  altitude?: number
  accuracy?: number
  speed?: number
  heading?: number
  timestamp: number
}

export interface RoutePoint {
  latitude: number
  longitude: number
}

export interface RouteSegment {
  points: RoutePoint[]
  startTime: number
  endTime?: number
}

export interface LocationPermissionStatus {
  hasPermission: boolean
  isCheckingPermission: boolean
  permissionError?: string
}

interface LocationStore {
  currentLocation: CurrentLocation | null
  routePoints: RoutePoint[]
  routeSegments: RouteSegment[]
  currentSegmentIndex: number
  totalDistance: number
  currentSpeed: number
  gpsAccuracy: number | null
  isGPSActive: boolean
  locationPermission: LocationPermissionStatus
  locationSubscription: Location.LocationSubscription | null
  
  setCurrentLocation: (location: CurrentLocation) => void
  addRoutePoint: (point: RoutePoint) => void
  startNewSegment: () => void
  endCurrentSegment: () => void
  clearRoute: () => void
  updateDistance: (distance: number) => void
  updateSpeed: (speed: number) => void
  setGPSAccuracy: (accuracy: number | null) => void
  setGPSActive: (active: boolean) => void
  setLocationPermission: (status: Partial<LocationPermissionStatus>) => void
  setLocationSubscription: (subscription: Location.LocationSubscription | null) => void
  calculateNewMiles: (existingGeometry?: any) => number
}

export const useLocationStore = create<LocationStore>()(
  devtools(
    (set, get) => ({
      currentLocation: null,
      routePoints: [],
      routeSegments: [],
      currentSegmentIndex: -1,
      totalDistance: 0,
      currentSpeed: 0,
      gpsAccuracy: null,
      isGPSActive: false,
      locationPermission: {
        hasPermission: false,
        isCheckingPermission: false
      },
      locationSubscription: null,
      
      setCurrentLocation: (location) => {
        set({ 
          currentLocation: location,
          currentSpeed: location.speed || 0,
          gpsAccuracy: location.accuracy || null
        })
      },
      
      addRoutePoint: (point) => {
        set((state) => {
          const newRoutePoints = [...state.routePoints, point]
          
          let routeSegments = state.routeSegments
          if (state.currentSegmentIndex >= 0 && state.currentSegmentIndex < routeSegments.length) {
            routeSegments = [...routeSegments]
            routeSegments[state.currentSegmentIndex] = {
              ...routeSegments[state.currentSegmentIndex],
              points: [...routeSegments[state.currentSegmentIndex].points, point]
            }
          }
          
          return {
            routePoints: newRoutePoints,
            routeSegments
          }
        })
      },
      
      startNewSegment: () => {
        set((state) => {
          const now = Date.now()
          const newSegment: RouteSegment = {
            points: [],
            startTime: now
          }
          
          return {
            routeSegments: [...state.routeSegments, newSegment],
            currentSegmentIndex: state.routeSegments.length
          }
        })
      },
      
      endCurrentSegment: () => {
        set((state) => {
          if (state.currentSegmentIndex < 0 || state.currentSegmentIndex >= state.routeSegments.length) {
            return state
          }
          
          const routeSegments = [...state.routeSegments]
          routeSegments[state.currentSegmentIndex] = {
            ...routeSegments[state.currentSegmentIndex],
            endTime: Date.now()
          }
          
          return { routeSegments }
        })
      },
      
      clearRoute: () => {
        set({
          routePoints: [],
          routeSegments: [],
          currentSegmentIndex: -1,
          totalDistance: 0,
          currentSpeed: 0
        })
      },
      
      updateDistance: (distance) => {
        set({ totalDistance: distance })
      },
      
      updateSpeed: (speed) => {
        set({ currentSpeed: speed })
      },
      
      setGPSAccuracy: (accuracy) => {
        set({ gpsAccuracy: accuracy })
      },
      
      setGPSActive: (active) => {
        set({ isGPSActive: active })
      },
      
      setLocationPermission: (status) => {
        set((state) => ({
          locationPermission: {
            ...state.locationPermission,
            ...status
          }
        }))
      },
      
      setLocationSubscription: (subscription) => {
        set({ locationSubscription: subscription })
      },
      
      calculateNewMiles: (existingGeometry) => {
        const { routePoints } = get()
        
        if (!existingGeometry || routePoints.length === 0) {
          return get().totalDistance
        }
        
        // TODO: Implement actual new miles calculation based on existing geometry
        // This will require geometry intersection logic
        // For now, return total distance as placeholder
        return get().totalDistance
      }
    }),
    {
      name: 'location-storage',
    }
  )
)