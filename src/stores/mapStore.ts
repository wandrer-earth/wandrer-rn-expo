import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type LocationMode = 0 | 1 | 2; // 0 = off, 1 = follow, 2 = compass

interface MapStore {
  locationMode: LocationMode
  trackUser: boolean
  setLocationMode: (mode: LocationMode) => void
  setTrackUser: (track: boolean) => void
  enableFollowMode: () => void
  disableFollowMode: () => void
}

export const useMapStore = create<MapStore>()(
  devtools(
    (set) => ({
      locationMode: 0,
      trackUser: false,

      setLocationMode: (mode) => set({
        locationMode: mode,
        trackUser: mode > 0
      }),

      setTrackUser: (track) => set({
        trackUser: track,
        locationMode: track ? 1 : 0
      }),

      enableFollowMode: () => set({
        locationMode: 1,
        trackUser: true
      }),

      disableFollowMode: () => set({
        locationMode: 0,
        trackUser: false
      }),
    }),
    {
      name: 'map-storage',
    }
  )
)