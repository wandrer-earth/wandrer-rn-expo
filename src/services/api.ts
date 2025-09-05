import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

// API Configuration matching source project
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://wandrer.earth'
const API_KEY = process.env.EXPO_PUBLIC_API_KEY || 'windy-cobblestone-6208'

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

// Request interceptor - Add auth token
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
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
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
    
    return Promise.reject(error)
  }
)

// File upload helper for GPX files
export const uploadGPX = (
  file: any, 
  onProgress?: (percent: number) => void
) => {
  const formData = new FormData()
  formData.append('gpx', {
    uri: file.uri,
    type: 'application/gpx+xml',
    name: file.name || 'ride.gpx',
  } as any)
  
  return api.post('/rides/upload', formData, {
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
}

export default api