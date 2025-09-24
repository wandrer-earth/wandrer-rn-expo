import { usePreferencesStore } from '../stores/preferencesStore'

export type UnitType = 'metric' | 'imperial'

const KM_TO_MILES = 0.621371
const M_TO_FEET = 3.28084

export const convertDistance = (kmValue: number, targetUnit: UnitType): number => {
  if (targetUnit === 'imperial') {
    return kmValue * KM_TO_MILES
  }
  return kmValue
}

export const convertSpeed = (kmhValue: number, targetUnit: UnitType): number => {
  if (targetUnit === 'imperial') {
    return kmhValue * KM_TO_MILES
  }
  return kmhValue
}

export const convertElevation = (meterValue: number, targetUnit: UnitType): number => {
  if (targetUnit === 'imperial') {
    return meterValue * M_TO_FEET
  }
  return meterValue
}

export const formatDistance = (kmValue: number, unitType?: UnitType): string => {
  const isMetric = unitType === 'metric'
  const convertedValue = convertDistance(kmValue, unitType || 'metric')

  if (isMetric) {
    if (kmValue < 1) {
      return `${Math.round(kmValue * 1000)}m`
    }
    return `${convertedValue.toFixed(2)}km`
  } else {
    if (convertedValue < 0.1) {
      const feet = Math.round(convertedValue * 5280)
      return `${feet}ft`
    }
    return `${convertedValue.toFixed(2)}mi`
  }
}

export const formatSpeed = (kmhValue: number, unitType?: UnitType): string => {
  const isMetric = unitType === 'metric'
  const convertedValue = convertSpeed(kmhValue, unitType || 'metric')
  const unit = isMetric ? 'km/h' : 'mph'

  return `${convertedValue.toFixed(1)} ${unit}`
}

export const formatElevation = (meterValue: number, unitType?: UnitType): string => {
  const isMetric = unitType === 'metric'
  const convertedValue = convertElevation(meterValue, unitType || 'metric')
  const unit = isMetric ? 'm' : 'ft'

  return `${Math.round(convertedValue)} ${unit}`
}

export const getUnitLabel = (unitType: UnitType): { distance: string; speed: string; elevation: string } => {
  if (unitType === 'imperial') {
    return {
      distance: 'mi',
      speed: 'mph',
      elevation: 'ft'
    }
  }

  return {
    distance: 'km',
    speed: 'km/h',
    elevation: 'm'
  }
}

export const useUnitPreference = (): UnitType => {
  const preferences = usePreferencesStore((state) => state.preferences)
  return preferences?.unit || 'metric'
}