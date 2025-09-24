import { usePreferencesStore } from '../stores/preferencesStore'

export type UnitType = 'meters' | 'feet'

const KM_TO_MILES = 0.621371
const M_TO_FEET = 3.28084

export const convertDistance = (kmValue: number, targetUnit: UnitType): number => {
  if (targetUnit === 'feet') {
    return kmValue * KM_TO_MILES
  }
  return kmValue
}

export const convertSpeed = (kmhValue: number, targetUnit: UnitType): number => {
  if (targetUnit === 'feet') {
    return kmhValue * KM_TO_MILES
  }
  return kmhValue
}

export const convertElevation = (meterValue: number, targetUnit: UnitType): number => {
  if (targetUnit === 'feet') {
    return meterValue * M_TO_FEET
  }
  return meterValue
}

export const formatDistance = (kmValue: number, unitType?: UnitType): string => {
  const isMetric = unitType === 'meters'
  const convertedValue = convertDistance(kmValue, unitType || 'meters')

  if (isMetric) {
    return `${convertedValue.toFixed(2)}km`
  } else {
    return `${convertedValue.toFixed(2)}mi`
  }
}

export const formatSpeed = (kmhValue: number, unitType?: UnitType): string => {

  const isMetric = unitType !== 'feet'
  const convertedValue = convertSpeed(kmhValue, unitType || 'meters')
  const unit = isMetric ? 'km/h' : 'mph'

  return `${convertedValue.toFixed(1)} ${unit}`
}

export const formatElevation = (meterValue: number, unitType?: UnitType): string => {
  const isMetric = unitType === 'meters'
  const convertedValue = convertElevation(meterValue, unitType || 'meters')
  const unit = isMetric ? 'm' : 'ft'

  return `${Math.round(convertedValue)} ${unit}`
}

export const getUnitLabel = (unitType: UnitType): { distance: string; speed: string; elevation: string } => {
  if (unitType === 'feet') {
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
  return preferences?.unit || 'meters'
}