import AsyncStorage from '@react-native-async-storage/async-storage'
import { BaseBuilder, buildGPX } from 'gpx-builder'
import moment from 'moment'
import api, { endpoints } from './api'
import { RideData, GPSPoint, useRideStore } from '../stores/rideStore'
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
      const updatedRides = [...existingRides, ride]
      await AsyncStorage.setItem(RIDES_STORAGE_KEY, JSON.stringify(updatedRides))
      
      const gpxData = await this.generateGPX(ride)
      
      const existingGpxData = await AsyncStorage.getItem(GPX_STORAGE_KEY)
      const gpxStorage = existingGpxData ? JSON.parse(existingGpxData) : {}
      gpxStorage[ride.id] = gpxData
      await AsyncStorage.setItem(GPX_STORAGE_KEY, JSON.stringify(gpxStorage))
      
      ride.gpxData = gpxData
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
      useRideStore.getState().updateRideUploadStatus(ride.id, 'uploading')
      
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
      
      const formData = new FormData()
      formData.append('gpx_activity[gpx]', {
        uri: `data:application/gpx+xml;base64,${Buffer.from(gpxData).toString('base64')}`,
        type: 'application/gpx+xml',
        name: `${ride.name.replace(/[^a-z0-9]/gi, '_')}.gpx`
      } as any)
      formData.append('gpx_activity[name]', ride.name)
      formData.append('gpx_activity[activity_type]', ride.activityType)
      
      const response = await api.post(endpoints.postGpxApi, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(percent)
          }
        },
      })
      
      useRideStore.getState().updateRideUploadStatus(ride.id, 'uploaded')
      
      if (response.data.new_miles !== undefined) {
        const rides = await this.getLocalRides()
        const updatedRide = rides.find(r => r.id === ride.id)
        if (updatedRide) {
          updatedRide.newMiles = response.data.new_miles
          await AsyncStorage.setItem(RIDES_STORAGE_KEY, JSON.stringify(rides))
          useRideStore.getState().setSavedRides(rides)
        }
      }
      
      return response.data
    } catch (error) {
      console.error('Failed to upload ride:', error)
      useRideStore.getState().updateRideUploadStatus(ride.id, 'failed')
      throw error
    }
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
    
    const points = ride.points.map(point => {
      return new Point(point.latitude, point.longitude, {
        ele: point.altitude,
        time: new Date(point.timestamp)
      })
    })
    
    const segment = new Segment(points)
    const track = new Track([segment], {
      name: ride.name
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
  
  calculateRideStats(points: GPSPoint[]): {
    distance: number
    averageSpeed: number
    maxSpeed: number
    duration: number
  } {
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