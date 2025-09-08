import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ActivityType, ACTIVITY_TYPES } from '../constants/activityTypes'
import colors from '../styles/colors'

export interface MapSettings {
  bikeLayerColor: string
  footLayerColor: string
  pavedLayerColor: string
  mobileTrackColor: string
}

interface MapSettingsStore {
  activityType: ActivityType
  traveledLayerChecked: boolean
  untraveledLayerChecked: boolean
  pavedLayerChecked: boolean
  unpavedLayerChecked: boolean
  superUniqueLayerChecked: boolean
  achievementsLayerChecked: boolean
  mapSettings: MapSettings
  
  setActivityType: (type: ActivityType) => void
  setTraveledLayerChecked: (checked: boolean) => void
  setUntraveledLayerChecked: (checked: boolean) => void
  setPavedLayerChecked: (checked: boolean) => void
  setUnpavedLayerChecked: (checked: boolean) => void
  setSuperUniqueLayerChecked: (checked: boolean) => void
  setAchievementsLayerChecked: (checked: boolean) => void
  setMapSettings: (settings: Partial<MapSettings>) => void
}

const defaultMapSettings: MapSettings = {
  bikeLayerColor: colors.primary,
  footLayerColor: colors.success,
  pavedLayerColor: colors.lightGray,
  mobileTrackColor: colors.warning,
}

export const useMapSettingsStore = create<MapSettingsStore>()(
  persist(
    (set, get) => ({
      activityType: ACTIVITY_TYPES.BIKE,
      traveledLayerChecked: true,
      untraveledLayerChecked: true,
      pavedLayerChecked: true,
      unpavedLayerChecked: true,
      superUniqueLayerChecked: false,
      achievementsLayerChecked: false,
      mapSettings: defaultMapSettings,

      setActivityType: (type) => set({ activityType: type }),
      
      setTraveledLayerChecked: (checked) => set({ traveledLayerChecked: checked }),
      
      setUntraveledLayerChecked: (checked) => {
        const currentState = get()
        set({ 
          untraveledLayerChecked: checked,
          pavedLayerChecked: checked,
          unpavedLayerChecked: checked,
        })
      },
      
      setPavedLayerChecked: (checked) => {
        const currentState = get()
        set({
          pavedLayerChecked: checked,
          untraveledLayerChecked: checked || currentState.unpavedLayerChecked
        })
      },
      
      setUnpavedLayerChecked: (checked) => {
        const currentState = get()
        set({
          unpavedLayerChecked: checked,
          untraveledLayerChecked: checked || currentState.pavedLayerChecked
        })
      },
      
      setSuperUniqueLayerChecked: (checked) => set({ superUniqueLayerChecked: checked }),
      
      setAchievementsLayerChecked: (checked) => set({ achievementsLayerChecked: checked }),
      
      setMapSettings: (settings) => set(state => ({
        mapSettings: { ...state.mapSettings, ...settings }
      })),
    }),
    {
      name: 'map-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        activityType: state.activityType,
        traveledLayerChecked: state.traveledLayerChecked,
        untraveledLayerChecked: state.untraveledLayerChecked,
        pavedLayerChecked: state.pavedLayerChecked,
        unpavedLayerChecked: state.unpavedLayerChecked,
        superUniqueLayerChecked: state.superUniqueLayerChecked,
        achievementsLayerChecked: state.achievementsLayerChecked,
        mapSettings: state.mapSettings,
      }),
    }
  )
)