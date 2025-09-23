import AsyncStorage from '@react-native-async-storage/async-storage'
import { BaseBuilder, buildGPX } from 'gpx-builder'
import moment from 'moment'
import api, { endpoints, uploadGPX, getNewMiles } from './api'
import { RideData, GPSPoint, RideSegment, useRideStore, ActivityType } from '../stores/rideStore'
import { useLocationStore } from '../stores/locationStore'

const RIDES_STORAGE_KEY = '@wandrer_saved_rides'
const GPX_STORAGE_KEY = '@wandrer_gpx_data'

export class RideService {
  private static instance: RideService
  
  static getInstance(): RideService {
    if (!RideService.instance) {
      RideService.instance = new RideService()
    }
    return RideService.instance
  }
  
  async saveRideLocally(ride: RideData): Promise<void> {
    try {
      const existingRides = await this.getLocalRides()
      
      // Ensure ride has upload status
      const rideToSave = {
        ...ride,
        uploadStatus: ride.uploadStatus || 'pending'
      }
      
      const updatedRides = [...existingRides, rideToSave]
      await AsyncStorage.setItem(RIDES_STORAGE_KEY, JSON.stringify(updatedRides))
      
      const gpxData = await this.generateGPX(rideToSave)
      
      const existingGpxData = await AsyncStorage.getItem(GPX_STORAGE_KEY)
      const gpxStorage = existingGpxData ? JSON.parse(existingGpxData) : {}
      gpxStorage[rideToSave.id] = gpxData
      await AsyncStorage.setItem(GPX_STORAGE_KEY, JSON.stringify(gpxStorage))
      
      rideToSave.gpxData = gpxData
      useRideStore.getState().setSavedRides(updatedRides)
    } catch (error) {
      console.error('Failed to save ride locally:', error)
      throw error
    }
  }
  
  async getLocalRides(): Promise<RideData[]> {
    try {
      const ridesJson = await AsyncStorage.getItem(RIDES_STORAGE_KEY)
      if (!ridesJson) return []
      
      const rides = JSON.parse(ridesJson) as RideData[]
      return rides.map(ride => ({
        ...ride,
        startTime: new Date(ride.startTime),
        endTime: ride.endTime ? new Date(ride.endTime) : undefined
      }))
    } catch (error) {
      console.error('Failed to load local rides:', error)
      return []
    }
  }
  
  async deleteLocalRide(rideId: string): Promise<void> {
    try {
      const rides = await this.getLocalRides()
      const filteredRides = rides.filter(ride => ride.id !== rideId)
      await AsyncStorage.setItem(RIDES_STORAGE_KEY, JSON.stringify(filteredRides))
      
      const existingGpxData = await AsyncStorage.getItem(GPX_STORAGE_KEY)
      if (existingGpxData) {
        const gpxStorage = JSON.parse(existingGpxData)
        delete gpxStorage[rideId]
        await AsyncStorage.setItem(GPX_STORAGE_KEY, JSON.stringify(gpxStorage))
      }
      
      useRideStore.getState().deleteRide(rideId)
    } catch (error) {
      console.error('Failed to delete ride:', error)
      throw error
    }
  }
  
  async uploadRide(ride: RideData, onProgress?: (percent: number) => void): Promise<any> {
    try {
      // Validate ride data before attempting upload
      const validationError = this.validateRideData(ride)
      if (validationError) {
        useRideStore.getState().updateRideUploadStatus(ride.id, 'failed')
        throw new Error(`Invalid ride data: ${validationError}`)
      }

      useRideStore.getState().updateRideUploadStatus(ride.id, 'uploading')

      // Get GPX data from various sources
      let gpxData = ride.gpxData
      if (!gpxData) {
        const existingGpxData = await AsyncStorage.getItem(GPX_STORAGE_KEY)
        if (existingGpxData) {
          const gpxStorage = JSON.parse(existingGpxData)
          gpxData = gpxStorage[ride.id]
        }
      }
      if (!gpxData) {
        gpxData = await this.generateGPX(ride)
      }

      // Validate GPX data
      if (!gpxData || gpxData.trim().length === 0) {
        throw new Error('Generated GPX data is empty')
      }

      console.log('📄 Uploading GPX with', ride.points?.length || 0, 'points and', ride.segments?.length || 0, 'segments')

      // Use the new uploadGPX function
      const response = await uploadGPX({
        gpxData,
        name: ride.name,
        activityType: ride.activityType,
        onProgress
      })

      // Always update the ride status in both store and AsyncStorage
      const rides = await this.getLocalRides()
      const updatedRide = rides.find(r => r.id === ride.id)
      if (updatedRide) {
        updatedRide.uploadStatus = 'uploaded'

        // Update new miles if returned
        if (response.new_miles !== undefined) {
          updatedRide.newMiles = response.new_miles
        }

        // Always persist to AsyncStorage and update store
        await AsyncStorage.setItem(RIDES_STORAGE_KEY, JSON.stringify(rides))
        useRideStore.getState().setSavedRides(rides)
      }

      // Also update the store directly for immediate UI response
      useRideStore.getState().updateRideUploadStatus(ride.id, 'uploaded')

      return response
    } catch (error) {
      console.error('Failed to upload ride:', error)
      useRideStore.getState().updateRideUploadStatus(ride.id, 'failed')
      throw error
    }
  }

  private validateRideData(ride: RideData): string | null {
    if (!ride.name || ride.name.trim().length === 0) {
      return 'Ride name is required'
    }

    if (!ride.activityType) {
      return 'Activity type is required'
    }

    if (!ride.startTime) {
      return 'Start time is required'
    }

    if (!ride.duration || ride.duration <= 0) {
      return 'Duration must be greater than 0'
    }

    const hasPointsInMainArray = ride.points && ride.points.length > 0
    const hasPointsInSegments = ride.segments && ride.segments.some(segment => segment.points.length > 0)

    if (!hasPointsInMainArray && !hasPointsInSegments) {
      return 'No GPS tracking data found'
    }

    return null
  }
  
  async retryFailedUploads(): Promise<void> {
    const rides = await this.getLocalRides()
    const failedRides = rides.filter(ride => ride.uploadStatus === 'failed' || ride.uploadStatus === 'pending')
    
    for (const ride of failedRides) {
      try {
        await this.uploadRide(ride)
      } catch (error) {
        console.error(`Failed to retry upload for ride ${ride.id}:`, error)
      }
    }
  }
  
  private async generateGPX(ride: RideData): Promise<string> {
    const { Point, Track, Segment, Metadata } = BaseBuilder.MODELS
    
    const segments = []
    
    if (ride.segments && ride.segments.length > 0) {
      for (const rideSegment of ride.segments) {
        if (rideSegment.points.length < 2) continue
        
        const points = rideSegment.points.map(point => {
          return new Point(point.latitude, point.longitude, {
            ele: point.altitude,
            time: new Date(point.timestamp)
          })
        })
        
        segments.push(new Segment(points))
      }
    } else {
      const points = ride.points.map(point => {
        return new Point(point.latitude, point.longitude, {
          ele: point.altitude,
          time: new Date(point.timestamp)
        })
      })
      
      segments.push(new Segment(points))
    }
    
    const track = new Track(segments, {
      name: ride.name,
      type: ride.activityType === 'foot' ? 'Foot' : 'Bike'
    })
    
    const metadata = new Metadata({
      name: ride.name,
      time: ride.startTime
    })
    
    const gpxData = new BaseBuilder()
    gpxData.setMetadata(metadata)
    gpxData.setTracks([track])
    
    return buildGPX(gpxData.toObject())
  }
  
  async getNewMilesFromAPI(gpxData: string): Promise<number> {
    try {
      const response = await api.post('/api/v1/gpx_activities/preview', {
        gpx: gpxData
      })
      
      return response.data.new_miles || 0
    } catch (error) {
      console.error('Failed to get new miles:', error)
      return 0
    }
  }
  
  async getNewMiles(points: [number, number][], activityType: ActivityType): Promise<{ unique_length: number; unique_geometry?: string }> {
    try {
      return await getNewMiles(points, activityType)
    } catch (error) {
      console.error('Failed to get new miles:', error)
      throw error
    }
  }

  calculateRideStats(points: GPSPoint[], segments?: RideSegment[]): {
    distance: number
    averageSpeed: number
    maxSpeed: number
    duration: number
  } {
    if (segments && segments.length > 0) {
      let totalDistance = 0
      let maxSpeed = 0
      let activeDuration = 0
      
      for (const segment of segments) {
        if (segment.points.length < 2) continue
        
        for (let i = 1; i < segment.points.length; i++) {
          const distance = this.calculateDistance(segment.points[i - 1], segment.points[i])
          totalDistance += distance
          
          if (segment.points[i].speed) {
            maxSpeed = Math.max(maxSpeed, segment.points[i].speed)
          }
        }
        
        const segmentDuration = (segment.endTime || segment.points[segment.points.length - 1].timestamp) - segment.startTime
        activeDuration += segmentDuration
      }
      
      const averageSpeed = activeDuration > 0 ? (totalDistance / activeDuration) * 3600000 : 0
      
      return {
        distance: totalDistance,
        averageSpeed,
        maxSpeed,
        duration: activeDuration
      }
    }
    
    if (points.length < 2) {
      return { distance: 0, averageSpeed: 0, maxSpeed: 0, duration: 0 }
    }
    
    let totalDistance = 0
    let maxSpeed = 0
    
    for (let i = 1; i < points.length; i++) {
      const distance = this.calculateDistance(points[i - 1], points[i])
      totalDistance += distance
      
      if (points[i].speed) {
        maxSpeed = Math.max(maxSpeed, points[i].speed)
      }
    }
    
    const duration = points[points.length - 1].timestamp - points[0].timestamp
    const averageSpeed = duration > 0 ? (totalDistance / duration) * 3600000 : 0
    
    return {
      distance: totalDistance,
      averageSpeed,
      maxSpeed,
      duration
    }
  }
  
  private calculateDistance(point1: GPSPoint, point2: GPSPoint): number {
    const EARTH_RADIUS_KM = 6371
    
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
  
  async getGPXData(rideId: string): Promise<string | null> {
    try {
      const existingGpxData = await AsyncStorage.getItem(GPX_STORAGE_KEY)
      if (existingGpxData) {
        const gpxStorage = JSON.parse(existingGpxData)
        return gpxStorage[rideId] || null
      }
      return null
    } catch (error) {
      console.error('Failed to get GPX data:', error)
      return null
    }
  }
  
  async getAllGPXData(): Promise<Record<string, string>> {
    try {
      const existingGpxData = await AsyncStorage.getItem(GPX_STORAGE_KEY)
      return existingGpxData ? JSON.parse(existingGpxData) : {}
    } catch (error) {
      console.error('Failed to get all GPX data:', error)
      return {}
    }
  }
}