import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

// API Configuration matching source project
const BASE_URL = 'https://wandrer.earth'

// API endpoints matching source project
export const endpoints = {
  loginApi: '/signin.json',
  postGpxApi: '/api/v1/gpx_activities',
  getRidesApi: '/api/v1/rides',
  getBoxApi: '/api/v1/athletes/bbox',
  getArenaRankings: '/api/v1/athletes/a_rankings',
  getAthletesApi: '/api/v1/athletes/',
  getAthleteRideApi: '/api/v1/athletes/rides',
  getLeaderboardApi: '/api/v1/arenas',
  getAchievements: '/api/v1/athletes/achievements',
  getPreferencesApi: '/api/v1/athletes/prefs',
}

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
})

// Set auth token (matching source project format)
export const setAuth = (auth: { token: string; id: number }) => {
  api.defaults.headers.common.Authorization = `Token token=${auth.token}, id=${auth.id}`
}

// Request interceptor - Add auth token and logging
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error)
    }
    
    // Log network requests in development
    if (__DEV__) {
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`)
      if (config.data) {
        console.log('📤 Request body:', config.data)
      }
    }
    
    return config
  },
  (error) => {
    if (__DEV__) {
      console.error('❌ Request error:', error)
    }
    return Promise.reject(error)
  }
)

// Response interceptor - Handle token refresh and logging
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (__DEV__) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // Import here to avoid circular dependency
        const { useAuthStore } = await import('../stores/authStore')
        await useAuthStore.getState().refreshToken()
        
        // Retry the original request with new token
        const newToken = await SecureStore.getItemAsync('token')
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api.request(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        const { useAuthStore } = await import('../stores/authStore')
        await useAuthStore.getState().logout()
        return Promise.reject(refreshError)
      }
    }
    
    // Log API errors in development
    if (__DEV__) {
      console.error(`❌ API Error: ${error.response?.status || 'Network'} ${error.config?.url}`, error.message)
    }
    
    return Promise.reject(error)
  }
)

// Upload GPX file for a ride activity
export interface UploadGPXOptions {
  gpxData: string
  name: string
  activityType: 'walk' | 'run' | 'bike' | 'other'
  onProgress?: (percent: number) => void
}

export interface UploadGPXResponse {
  success: boolean
  new_miles?: number
  ride_id?: string
  message?: string
}

export const uploadGPX = async (
  options: UploadGPXOptions
): Promise<UploadGPXResponse> => {
  const { gpxData, name, activityType, onProgress } = options
  
  const formData = new FormData()
  
  // Create a blob from the GPX string data
  const gpxBlob = new Blob([gpxData], { type: 'application/gpx+xml' })
  
  // Append the GPX file as form data
  formData.append('gpx_activity[gpx]', gpxBlob, `${name.replace(/[^a-z0-9]/gi, '_')}.gpx`)
  formData.append('gpx_activity[name]', name)
  formData.append('gpx_activity[activity_type]', activityType)
  
  try {
    const response = await api.post<UploadGPXResponse>(endpoints.postGpxApi, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress(percent)
        }
      },
    })
    
    return response.data
  } catch (error) {
    console.error('GPX upload failed:', error)
    throw error
  }
}

export default api