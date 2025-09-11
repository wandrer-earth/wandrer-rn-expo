import { ActivityType, ACTIVITY_TYPES } from '../constants/activityTypes'

export interface MapSettings {
  bikeLayerColor: string
  footLayerColor: string
  pavedLayerColor: string
  mobileTrackColor?: string
}

export const getTraveledColor = (activityType: ActivityType, settings: MapSettings): string[] => {
  switch (activityType) {
    case ACTIVITY_TYPES.BIKE:
      return [settings.bikeLayerColor]
    case ACTIVITY_TYPES.FOOT:
      return [settings.footLayerColor]
    case ACTIVITY_TYPES.COMBINED:
      return [settings.bikeLayerColor, settings.footLayerColor]
    default:
      return ['gray']
  }
}

export const getSuntColor = (activityType: ActivityType, settings: MapSettings): string[] => {
  const suntColorMap = {
    [ACTIVITY_TYPES.BIKE]: [settings.bikeLayerColor, settings.pavedLayerColor],
    [ACTIVITY_TYPES.FOOT]: [settings.footLayerColor, settings.pavedLayerColor],
    [ACTIVITY_TYPES.COMBINED]: ['gray', settings.pavedLayerColor]
  }
  return suntColorMap[activityType] || ['gray', settings.pavedLayerColor]
}

export const getUntraveledColor = (settings: MapSettings): string => {
  return settings.pavedLayerColor
}