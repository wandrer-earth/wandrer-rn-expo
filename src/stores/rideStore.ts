import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { useLocationStore } from './locationStore'

export type RecordingState = 'not_tracking' | 'tracking' | 'paused' | 'finishing'
export type ActivityType = 'bike' | 'foot'

export interface GPSPoint {
  latitude: number
  longitude: number
  altitude?: number
  timestamp: number
  speed?: number
  accuracy?: number
}

export interface RideSegment {
  points: GPSPoint[]
  startTime: number
  endTime?: number
}

export interface PauseEvent {
  pauseTime: number
  resumeTime?: number
  location?: {
    latitude: number
    longitude: number
  }
}

export interface RideData {
  id: string
  name: string
  startTime: Date
  endTime?: Date
  duration: number
  distance: number
  averageSpeed: number
  maxSpeed: number
  points: GPSPoint[]
  segments?: RideSegment[]
  pauseEvents?: PauseEvent[]
  activityType: ActivityType
  newMiles?: number
  uniqueGeometry?: string
  uploadStatus: 'pending' | 'uploading' | 'uploaded' | 'failed'
  gpxData?: string
  retryCount?: number
}

interface RideStore {
  recordingState: RecordingState
  currentRide: Partial<RideData> | null
  currentSegmentIndex: number
  savedRides: RideData[]
  activityType: ActivityType
  
  setRecordingState: (state: RecordingState) => void
  setActivityType: (type: ActivityType) => void
  startRecording: () => void
  pauseRecording: () => void
  resumeRecording: () => void
  stopRecording: () => void
  cancelRecording: () => void
  saveRide: (name: string) => Promise<void>
  updateCurrentRide: (data: Partial<RideData>) => void
  addPoint: (point: GPSPoint) => void
  updateRideStats: (distance: number, speed: number) => void
  updateNewMiles: (newMiles: number, uniqueGeometry?: string) => void
  setSavedRides: (rides: RideData[]) => void
  updateRideUploadStatus: (rideId: string, status: RideData['uploadStatus']) => void
  deleteRide: (rideId: string) => void
}

export const useRideStore = create<RideStore>()(
  devtools(
    (set, get) => ({
      recordingState: 'not_tracking',
      currentRide: null,
      currentSegmentIndex: -1,
      savedRides: [],
      activityType: 'bike',
      
      setRecordingState: (state) => set({ recordingState: state }),
      
      setActivityType: (type) => set({ activityType: type }),
      
      startRecording: () => {
        const rideId = `ride_${Date.now()}`
        const now = Date.now()

        // Clear unique geometry when starting a new ride
        try {
          const { clearUniqueGeometry } = require('../stores/uniqueGeometryStore').useUniqueGeometryStore.getState()
          clearUniqueGeometry()
        } catch (error) {
          // uniqueGeometryStore might not exist, that's okay
        }
        set({
          recordingState: 'tracking',
          currentSegmentIndex: 0,
          currentRide: {
            id: rideId,
            startTime: new Date(),
            duration: 0,
            distance: 0,
            averageSpeed: 0,
            maxSpeed: 0,
            points: [],
            segments: [{
              points: [],
              startTime: now
            }],
            pauseEvents: [],
            activityType: get().activityType,
            uploadStatus: 'pending'
          }
        })
      },
      
      pauseRecording: () => {
        const { currentRide, currentSegmentIndex, recordingState } = get()
        const { currentLocation } = useLocationStore.getState()
        
        if (!currentRide || !currentRide.segments || recordingState !== 'tracking') return
        
        const now = Date.now()
        
        const lastPauseEvent = currentRide.pauseEvents?.[currentRide.pauseEvents.length - 1]
        if (lastPauseEvent && !lastPauseEvent.resumeTime && now - lastPauseEvent.pauseTime < 1000) {
          console.warn('Ignoring rapid pause event')
          return
        }
        
        set((state) => {
          if (!state.currentRide || !state.currentRide.segments) return state
          
          const segments = [...state.currentRide.segments]
          if (currentSegmentIndex >= 0 && currentSegmentIndex < segments.length) {
            segments[currentSegmentIndex] = {
              ...segments[currentSegmentIndex],
              endTime: now
            }
          }
          
          const pauseEvents = [...(state.currentRide.pauseEvents || [])]
          pauseEvents.push({
            pauseTime: now,
            location: currentLocation ? {
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude
            } : undefined
          })
          
          return {
            ...state,
            recordingState: 'paused',
            currentRide: {
              ...state.currentRide,
              segments,
              pauseEvents
            }
          }
        })
      },
      
      resumeRecording: () => {
        const { currentRide, recordingState } = get()
        if (!currentRide || !currentRide.segments || recordingState !== 'paused') return
        
        const now = Date.now()
        
        const lastPauseEvent = currentRide.pauseEvents?.[currentRide.pauseEvents.length - 1]
        if (lastPauseEvent && lastPauseEvent.resumeTime && now - lastPauseEvent.resumeTime < 1000) {
          console.warn('Ignoring rapid resume event')
          return
        }
        
        set((state) => {
          if (!state.currentRide || !state.currentRide.segments) return state
          
          const segments = [...state.currentRide.segments]
          segments.push({
            points: [],
            startTime: now
          })
          
          const pauseEvents = [...(state.currentRide.pauseEvents || [])]
          if (pauseEvents.length > 0 && !pauseEvents[pauseEvents.length - 1].resumeTime) {
            pauseEvents[pauseEvents.length - 1].resumeTime = now
          }
          
          return {
            ...state,
            recordingState: 'tracking',
            currentSegmentIndex: segments.length - 1,
            currentRide: {
              ...state.currentRide,
              segments,
              pauseEvents
            }
          }
        })
      },
      
      stopRecording: () => {
        const { currentSegmentIndex } = get()
        
        set((state) => {
          if (!state.currentRide || !state.currentRide.segments) {
            return { recordingState: 'finishing' }
          }
          
          const segments = [...state.currentRide.segments]
          if (currentSegmentIndex >= 0 && currentSegmentIndex < segments.length && !segments[currentSegmentIndex].endTime) {
            segments[currentSegmentIndex] = {
              ...segments[currentSegmentIndex],
              endTime: Date.now()
            }
          }
          
          return {
            recordingState: 'finishing',
            currentRide: {
              ...state.currentRide,
              segments
            }
          }
        })
      },
      
      cancelRecording: () => set({ 
        recordingState: 'not_tracking',
        currentRide: null 
      }),
      
      saveRide: async (name) => {
        const { currentRide } = get()
        if (!currentRide || !currentRide.id) return
        
        const completedRide: RideData = {
          ...currentRide as RideData,
          name,
          endTime: new Date(),
          duration: Date.now() - (currentRide.startTime?.getTime() || 0)
        }
        
        set((state) => ({
          savedRides: [...state.savedRides, completedRide],
          currentRide: null,
          recordingState: 'not_tracking'
        }))
      },
      
      updateCurrentRide: (data) => {
        set((state) => ({
          currentRide: state.currentRide ? { ...state.currentRide, ...data } : null
        }))
      },
      
      addPoint: (point) => {
        set((state) => {
          if (!state.currentRide) return state
          
          const points = [...(state.currentRide.points || []), point]
          const maxSpeed = Math.max(state.currentRide.maxSpeed || 0, point.speed || 0)
          
          let segments = state.currentRide.segments
          if (segments && state.currentSegmentIndex >= 0 && state.currentSegmentIndex < segments.length) {
            segments = [...segments]
            segments[state.currentSegmentIndex] = {
              ...segments[state.currentSegmentIndex],
              points: [...segments[state.currentSegmentIndex].points, point]
            }
          }
          
          return {
            currentRide: {
              ...state.currentRide,
              points,
              segments,
              maxSpeed
            }
          }
        })
      },
      
      updateRideStats: (distance, speed) => {
        set((state) => {
          if (!state.currentRide || !state.currentRide.startTime) return state
          
          const duration = Date.now() - state.currentRide.startTime.getTime()
          const averageSpeed = distance > 0 ? (distance / duration) * 3600000 : 0
          
          return {
            currentRide: {
              ...state.currentRide,
              distance,
              duration,
              averageSpeed
            }
          }
        })
      },
      
      updateNewMiles: (newMiles, uniqueGeometry) => {
        set((state) => {
          if (!state.currentRide) return state
          
          return {
            currentRide: {
              ...state.currentRide,
              newMiles,
              uniqueGeometry
            }
          }
        })
      },
      
      setSavedRides: (rides) => set({ savedRides: rides }),
      
      updateRideUploadStatus: (rideId, status) => {
        set((state) => ({
          savedRides: state.savedRides.map((ride) =>
            ride.id === rideId ? { ...ride, uploadStatus: status } : ride
          )
        }))
      },
      
      deleteRide: (rideId) => {
        set((state) => ({
          savedRides: state.savedRides.filter((ride) => ride.id !== rideId)
        }))
      }
    }),
    {
      name: 'ride-storage',
    }
  )
)