import { useEffect } from 'react'
import { useUserPreferences } from './api/useAuth'
import { usePreferencesStore } from '../stores/preferencesStore'
import { UnitType } from '../utils/unitUtils'

export const usePreferences = () => {
  const { data: apiPreferences, isLoading: apiLoading, error: apiError } = useUserPreferences()
  const {
    preferences,
    isLoading: localLoading,
    error: localError,
    setPreferences,
    setLoading,
    setError,
    setUnitPreference
  } = usePreferencesStore()

  useEffect(() => {
    setLoading(apiLoading)
  }, [apiLoading, setLoading])

  useEffect(() => {
    setError(apiError?.message || null)
  }, [apiError, setError])

  useEffect(() => {
    if (apiPreferences) {
      const processedPreferences = {
        unit: apiPreferences.unit,
        achievementIds: apiPreferences.achievementIds || {},
        ...apiPreferences
      }

      setPreferences(processedPreferences)
    }
  }, [apiPreferences, setPreferences])

  const isMetric = preferences?.unit !== 'feet'
  const unitType: UnitType = preferences?.unit || 'meters'

  return {
    preferences,
    unitType,
    isMetric,
    isLoading: apiLoading || localLoading,
    error: apiError || localError,
    setUnitPreference,
    hasPreferences: !!preferences
  }
}