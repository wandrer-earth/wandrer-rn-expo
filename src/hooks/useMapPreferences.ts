import { useEffect } from 'react'
import { useUserPreferences } from './api/useAuth'
import { useMapSettingsStore, AchievementData } from '../stores/mapSettingsStore'

export const useMapPreferences = () => {
  const { data: preferences, isLoading, error } = useUserPreferences()
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