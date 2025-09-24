import { usePreferences } from './usePreferences'
import { useMapSettingsStore, AchievementData } from '../stores/mapSettingsStore'
import { useEffect } from 'react'

export const useMapPreferences = () => {
  const { preferences, isLoading, error } = usePreferences()
  const setAchievementIds = useMapSettingsStore((state) => state.setAchievementIds)

  useEffect(() => {
    if (!preferences?.achievementIds) return

    const { achievementIds } = preferences

    const parsedAchievementData: AchievementData = {
      bike: achievementIds.bike || [],
      foot: achievementIds.foot || [],
      combined: achievementIds.combined || [],
    }

    setAchievementIds(parsedAchievementData)
  }, [preferences, setAchievementIds])

  return {
    preferencesLoading: isLoading,
    preferencesError: error,
    hasPreferences: !!preferences
  }
}