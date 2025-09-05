import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

// Create axios instance
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.wandrer.earth',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

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