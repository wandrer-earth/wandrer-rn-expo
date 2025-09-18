import * as Location from 'expo-location'

interface LocationResult {
  coords: {
    latitude: number
    longitude: number
    accuracy: number | null
  }
  timestamp: number
}

export async function checkLocationPermission(): Promise<boolean> {
  const { status } = await Location.getForegroundPermissionsAsync()
  return status === 'granted'
}

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync()
  return status === 'granted'
}

export async function getCurrentMapLocation(): Promise<[number, number] | null> {
  try {
    const hasPermission = await checkLocationPermission()
    if (!hasPermission) {
      return null
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 10000, // 10 seconds
    })

    if (location) {
      return [location.coords.longitude, location.coords.latitude]
    }
    
    return null
  } catch (error) {
    console.error('Error getting current location:', error)
    return null
  }
}

export async function getLastKnownMapLocation(): Promise<[number, number] | null> {
  try {
    const hasPermission = await checkLocationPermission()
    if (!hasPermission) {
      return null
    }

    const location = await Location.getLastKnownPositionAsync({
      requiredAccuracy: 1000, // meters
    })

    if (location) {
      return [location.coords.longitude, location.coords.latitude]
    }
    
    return null
  } catch (error) {
    console.error('Error getting last known location:', error)
    return null
  }
}

export function isLocationRecent(timestamp: number, maxAgeMinutes: number = 30): boolean {
  const ageMinutes = (Date.now() - timestamp) / (1000 * 60)
  return ageMinutes < maxAgeMinutes
}

export async function getInitialMapLocation(): Promise<[number, number] | null> {
  try {
    // Try to get current location first
    let location = await getCurrentMapLocation()
    
    // If that fails, try last known location
    if (!location) {
      location = await getLastKnownMapLocation()
    }
    
    return location
  } catch (error) {
    console.error('Error getting initial map location:', error)
    return null
  }
}