import * as Location from 'expo-location'
import { useLocationStore } from '../stores/locationStore'
import { useRideStore, GPSPoint } from '../stores/rideStore'
import { useUniqueGeometryStore } from '../stores/uniqueGeometryStore'
import { getNewMiles } from './api'

const LOCATION_UPDATE_INTERVAL = 1000
const LOCATION_DISTANCE_INTERVAL = 5
const EARTH_RADIUS_KM = 6371
const UNIQUE_MILES_UPDATE_INTERVAL = 3000

export class LocationService {
  private static instance: LocationService
  private lastUniqueUpdateTime: number = 0
  private accumulatedPoints: [number, number][] = []
  
  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService()
    }
    return LocationService.instance
  }
  
  async requestLocationPermissions(): Promise<boolean> {
    const { setLocationPermission } = useLocationStore.getState()
    
    setLocationPermission({ isCheckingPermission: true })
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      const hasPermission = status === 'granted'
      
      if (hasPermission) {
        const backgroundStatus = await Location.requestBackgroundPermissionsAsync()
        const hasBackgroundPermission = backgroundStatus.status === 'granted'
        
        setLocationPermission({
          hasPermission: hasBackgroundPermission,
          isCheckingPermission: false,
          permissionError: hasBackgroundPermission ? undefined : 'Background location permission denied'
        })
        
        return hasBackgroundPermission
      }
      
      setLocationPermission({
        hasPermission: false,
        isCheckingPermission: false,
        permissionError: 'Location permission denied'
      })
      
      return false
    } catch (error) {
      setLocationPermission({
        hasPermission: false,
        isCheckingPermission: false,
        permissionError: error instanceof Error ? error.message : 'Failed to request permissions'
      })
      return false
    }
  }
  
  async startLocationTracking(): Promise<void> {
    const { setLocationSubscription, setGPSActive } = useLocationStore.getState()
    const { addPoint } = useRideStore.getState()
    
    // Reset accumulated points and timer when starting tracking
    this.accumulatedPoints = []
    this.lastUniqueUpdateTime = Date.now()
    
    const hasPermission = await this.requestLocationPermissions()
    if (!hasPermission) {
      throw new Error('Location permissions not granted')
    }
    
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: LOCATION_UPDATE_INTERVAL,
        distanceInterval: LOCATION_DISTANCE_INTERVAL,
      },
      (location) => {
        const { setCurrentLocation, addRoutePoint, updateDistance } = useLocationStore.getState()
        const { recordingState } = useRideStore.getState()
        
        const currentLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          altitude: location.coords.altitude || undefined,
          accuracy: location.coords.accuracy || undefined,
          speed: location.coords.speed || undefined,
          heading: location.coords.heading || undefined,
          timestamp: location.timestamp
        }
        
        setCurrentLocation(currentLocation)
        
        if (recordingState === 'tracking') {
          const point: GPSPoint = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            altitude: location.coords.altitude || undefined,
            timestamp: location.timestamp,
            speed: location.coords.speed || undefined,
            accuracy: location.coords.accuracy || undefined
          }
          
          addPoint(point)
          addRoutePoint({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          })
          
          // Accumulate points for unique miles calculation
          this.accumulatedPoints.push([location.coords.latitude, location.coords.longitude])
          
          this.updateDistanceAndSpeed()
          
          // Update unique miles every 3 seconds
          const currentTime = Date.now()
          if (currentTime - this.lastUniqueUpdateTime >= UNIQUE_MILES_UPDATE_INTERVAL && this.accumulatedPoints.length > 0) {
            this.updateUniqueMiles()
            this.lastUniqueUpdateTime = currentTime
          }
        }
      }
    )
    
    setLocationSubscription(subscription)
    setGPSActive(true)
  }
  
  async stopLocationTracking(): Promise<void> {
    const { locationSubscription, setLocationSubscription, setGPSActive } = useLocationStore.getState()
    
    if (locationSubscription) {
      locationSubscription.remove()
      setLocationSubscription(null)
    }
    
    setGPSActive(false)
  }
  
  private updateDistanceAndSpeed(): void {
    const { routeSegments, updateDistance } = useLocationStore.getState()
    const { updateRideStats } = useRideStore.getState()
    
    let totalDistance = 0
    
    for (const segment of routeSegments) {
      if (segment.points.length < 2) continue
      
      for (let i = 1; i < segment.points.length; i++) {
        const distance = this.calculateDistance(
          segment.points[i - 1],
          segment.points[i]
        )
        totalDistance += distance
      }
    }
    
    updateDistance(totalDistance)
    
    const lastPoint = useLocationStore.getState().currentLocation
    const speed = lastPoint?.speed || 0
    
    updateRideStats(totalDistance, speed)
  }
  
  private calculateDistance(point1: { latitude: number; longitude: number }, point2: { latitude: number; longitude: number }): number {
    const lat1Rad = this.toRadians(point1.latitude)
    const lat2Rad = this.toRadians(point2.latitude)
    const deltaLatRad = this.toRadians(point2.latitude - point1.latitude)
    const deltaLonRad = this.toRadians(point2.longitude - point1.longitude)
    
    const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) *
      Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    
    return EARTH_RADIUS_KM * c
  }
  
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }
  
  async getCurrentLocation(): Promise<Location.LocationObject | null> {
    const hasPermission = await this.requestLocationPermissions()
    if (!hasPermission) return null
    
    try {
      return await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation
      })
    } catch (error) {
      console.error('Failed to get current location:', error)
      return null
    }
  }
  
  private async updateUniqueMiles(): Promise<void> {
    const { activityType, updateNewMiles } = useRideStore.getState()
    const { setUniqueGeometry } = useUniqueGeometryStore.getState()
    
    if (this.accumulatedPoints.length === 0) return
    
    try {
      // Call API with accumulated points
      const result = await getNewMiles(this.accumulatedPoints, activityType)
      
      // Update ride store with new miles
      if (typeof result.unique_length === 'number') {
        updateNewMiles(result.unique_length, result.unique_geometry)
      }
      
      // Update unique geometry store for map display
      if (result.unique_geometry) {
        setUniqueGeometry(result.unique_geometry)
      }
      
      // Clear accumulated points after successful update
      this.accumulatedPoints = []
    } catch (error) {
      console.error('Error updating unique miles:', error)
      // Keep accumulated points on error to retry next time
    }
  }
}