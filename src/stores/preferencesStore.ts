import { create } from 'zustand'
import { subscribeWithSelector, persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { UnitType } from '../utils/unitUtils'

export interface UserPreferences {
  unit: UnitType
  achievementIds?: {
    bike?: number[]
    foot?: number[]
    combined?: number[]
  }
  [key: string]: any // Allow for future preferences
}

interface PreferencesStore {
  preferences: UserPreferences | null
  isLoading: boolean
  error: string | null

  // Actions
  setPreferences: (preferences: UserPreferences) => void
  updatePreferences: (updates: Partial<UserPreferences>) => void
  setUnitPreference: (unit: UnitType) => void
  clearPreferences: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const DEFAULT_PREFERENCES: UserPreferences = {
  unit: 'metric'
}

export const usePreferencesStore = create<PreferencesStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        preferences: null,
        isLoading: false,
        error: null,

        setPreferences: (preferences: UserPreferences) => {
          set({ preferences, error: null })
        },

        updatePreferences: (updates: Partial<UserPreferences>) => {
          const currentPrefs = get().preferences || DEFAULT_PREFERENCES
          const updatedPrefs = { ...currentPrefs, ...updates }
          set({ preferences: updatedPrefs, error: null })
        },

        setUnitPreference: (unit: UnitType) => {
          get().updatePreferences({ unit })
        },

        clearPreferences: () => {
          set({ preferences: null, error: null })
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading })
        },

        setError: (error: string | null) => {
          set({ error })
        },
      }),
      {
        name: 'preferences-storage',
        storage: createJSONStorage(() => AsyncStorage),
        partialize: (state) => ({
          preferences: state.preferences
        })
      }
    )
  )
)