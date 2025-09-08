import { ActivityType, ACTIVITY_TYPES } from '../constants/activityTypes'
import colors from '../styles/colors'

export interface MapSettings {
  bikeLayerColor?: string
  footLayerColor?: string
  pavedLayerColor?: string
  mobileTrackColor?: string
}

export const getTraveledColor = (activityType: ActivityType, mapSettings?: MapSettings): string[] => {
  if (activityType === ACTIVITY_TYPES.BIKE) {
    return [mapSettings?.bikeLayerColor || colors.primary]
  }
  return [mapSettings?.footLayerColor || colors.success]
}

export const getSuntColor = (_activityType: ActivityType, mapSettings?: MapSettings): string[] => {
  return [mapSettings?.mobileTrackColor || colors.warning]
}

export const getUntraveledColor = (mapSettings?: MapSettings): string => {
  return mapSettings?.pavedLayerColor || colors.lightGray
}