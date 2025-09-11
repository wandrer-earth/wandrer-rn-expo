import * as Network from 'expo-network'
import { RideService } from './rideService'
import { useRideStore } from '../stores/rideStore'

export class UploadMonitorService {
  private static instance: UploadMonitorService
  private isMonitoring = false
  private networkCheckInterval: NodeJS.Timeout | null = null
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map()
  private ridesBeingRetried: Set<string> = new Set()
  private rideService: RideService
  
  private constructor() {
    this.rideService = RideService.getInstance()
  }
  
  static getInstance(): UploadMonitorService {
    if (!UploadMonitorService.instance) {
      UploadMonitorService.instance = new UploadMonitorService()
    }
    return UploadMonitorService.instance
  }
  
  async startMonitoring() {
    if (this.isMonitoring) return
    
    this.isMonitoring = true
    
    // Disabled automatic retry - manual upload only
    // this.checkAndRetryPendingUploads()
    // this.startNetworkMonitoring()
  }
  
  private async startNetworkMonitoring() {
    // Check network status every 30 seconds
    this.networkCheckInterval = setInterval(async () => {
      if (!this.isMonitoring) {
        if (this.networkCheckInterval) {
          clearInterval(this.networkCheckInterval)
          this.networkCheckInterval = null
        }
        return
      }
      
      try {
        const networkState = await Network.getNetworkStateAsync()
        if (networkState.isConnected && networkState.isInternetReachable) {
          console.log('Network available, checking for pending uploads...')
          this.checkAndRetryPendingUploads()
        }
      } catch (error) {
        console.error('Failed to check network state:', error)
      }
    }, 30000) // Check every 30 seconds
  }
  
  stopMonitoring() {
    this.isMonitoring = false
    
    if (this.networkCheckInterval) {
      clearInterval(this.networkCheckInterval)
      this.networkCheckInterval = null
    }
    
    // Clear all retry timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout))
    this.retryTimeouts.clear()
    this.ridesBeingRetried.clear()
  }
  
  private async checkAndRetryPendingUploads() {
    try {
      const rides = await this.rideService.getLocalRides()
      const pendingRides = rides.filter(
        ride => ride.uploadStatus === 'pending' || ride.uploadStatus === 'failed'
      )
      
      if (pendingRides.length === 0) return
      
      console.log(`Found ${pendingRides.length} rides to retry uploading`)
      
      for (const ride of pendingRides) {
        // Skip if already scheduled for retry or currently being retried
        if (this.retryTimeouts.has(ride.id) || this.ridesBeingRetried.has(ride.id)) continue
        
        // Schedule retry with exponential backoff
        const retryCount = ride.retryCount || 0
        const delay = Math.min(1000 * Math.pow(2, retryCount), 60000) // Max 1 minute
        
        console.log(`Scheduling upload retry for ride ${ride.id} in ${delay}ms`)
        
        this.ridesBeingRetried.add(ride.id)
        const timeout = setTimeout(async () => {
          this.retryTimeouts.delete(ride.id)
          await this.retryUploadWithBackoff(ride)
        }, delay)
        
        this.retryTimeouts.set(ride.id, timeout)
      }
    } catch (error) {
      console.error('Failed to check pending uploads:', error)
    }
  }
  
  private async retryUploadWithBackoff(ride: any) {
    try {
      console.log(`Retrying upload for ride ${ride.id}`)
      
      await this.rideService.uploadRide(ride)
      
      console.log(`Successfully uploaded ride ${ride.id}`)
      this.ridesBeingRetried.delete(ride.id)
    } catch (error) {
      console.error(`Failed to upload ride ${ride.id}:`, error)
      
      // Update retry count
      const rides = await this.rideService.getLocalRides()
      const rideToUpdate = rides.find(r => r.id === ride.id)
      
      if (rideToUpdate) {
        rideToUpdate.retryCount = (rideToUpdate.retryCount || 0) + 1
        
        // Max 5 retries
        if (rideToUpdate.retryCount < 5) {
          // Schedule next retry
          const delay = Math.min(1000 * Math.pow(2, rideToUpdate.retryCount), 60000)
          
          console.log(`Scheduling next retry for ride ${ride.id} in ${delay}ms (attempt ${rideToUpdate.retryCount + 1}/5)`)
          
          const timeout = setTimeout(async () => {
            this.retryTimeouts.delete(ride.id)
            await this.retryUploadWithBackoff(rideToUpdate)
          }, delay)
          
          this.retryTimeouts.set(ride.id, timeout)
        } else {
          console.error(`Max retries reached for ride ${ride.id}`)
          useRideStore.getState().updateRideUploadStatus(ride.id, 'failed')
          this.ridesBeingRetried.delete(ride.id)
        }
      } else {
        this.ridesBeingRetried.delete(ride.id)
      }
    }
  }
  
  // Manual retry for a specific ride (resets retry count)
  async retryRideUpload(rideId: string) {
    // Cancel any scheduled retry
    const existingTimeout = this.retryTimeouts.get(rideId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
      this.retryTimeouts.delete(rideId)
    }
    
    // Remove from being retried set to allow manual retry
    this.ridesBeingRetried.delete(rideId)
    
    const rides = await this.rideService.getLocalRides()
    const ride = rides.find(r => r.id === rideId)
    
    if (ride) {
      ride.retryCount = 0 // Reset retry count for manual retry
      this.ridesBeingRetried.add(rideId)
      await this.retryUploadWithBackoff(ride)
    }
  }
}