import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

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
  activityType: ActivityType
  newMiles?: number
  uploadStatus: 'pending' | 'uploading' | 'uploaded' | 'failed'
  gpxData?: string
  retryCount?: number
}

interface RideStore {
  recordingState: RecordingState
  currentRide: Partial<RideData> | null
  savedRides: RideData[]
  activityType: ActivityType
  
  setRecordingState: (state: RecordingState) => void
  setActivityType: (type: ActivityType) => void
  startRecording: () => void
  pauseRecording: () => void
  resumeRecording: () => void
  stopRecording: () => void
  saveRide: (name: string) => Promise<void>
  updateCurrentRide: (data: Partial<RideData>) => void
  addPoint: (point: GPSPoint) => void
  updateRideStats: (distance: number, speed: number) => void
  setSavedRides: (rides: RideData[]) => void
  updateRideUploadStatus: (rideId: string, status: RideData['uploadStatus']) => void
  deleteRide: (rideId: string) => void
}

export const useRideStore = create<RideStore>()(
  devtools(
    (set, get) => ({
      recordingState: 'not_tracking',
      currentRide: null,
      savedRides: [],
      activityType: 'bike',
      
      setRecordingState: (state) => set({ recordingState: state }),
      
      setActivityType: (type) => set({ activityType: type }),
      
      startRecording: () => {
        const rideId = `ride_${Date.now()}`
        set({
          recordingState: 'tracking',
          currentRide: {
            id: rideId,
            startTime: new Date(),
            duration: 0,
            distance: 0,
            averageSpeed: 0,
            maxSpeed: 0,
            points: [],
            activityType: get().activityType,
            uploadStatus: 'pending'
          }
        })
      },
      
      pauseRecording: () => set({ recordingState: 'paused' }),
      
      resumeRecording: () => set({ recordingState: 'tracking' }),
      
      stopRecording: () => set({ recordingState: 'finishing' }),
      
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
          
          return {
            currentRide: {
              ...state.currentRide,
              points,
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