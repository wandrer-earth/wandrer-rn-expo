import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import { BASE_URL } from '../constants/urls'

// Auth handlers interface for callback pattern
interface AuthHandlers {
  onLogout: () => Promise<void>
  onRefreshToken: () => Promise<void>
}

// Auth handlers - registered by authStore
let authHandlers: AuthHandlers | null = null

// Function to register auth handlers (called by authStore)
export const setAuthHandlers = (handlers: AuthHandlers) => {
  authHandlers = handlers
}

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
      const userId = await SecureStore.getItemAsync('userId')
      if (token && userId) {
        // Use the same auth format as the original app
        config.headers.Authorization = `Token token=${token}, id=${userId}`
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

    if (error.response?.status === 401 && !originalRequest._retry && authHandlers) {
      originalRequest._retry = true

      try {
        await authHandlers.onRefreshToken()

        // Retry the original request with new token
        const newToken = await SecureStore.getItemAsync('token')
        const userId = await SecureStore.getItemAsync('userId')
        if (newToken && userId) {
          originalRequest.headers.Authorization = `Token token=${newToken}, id=${userId}`
          return api.request(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        await authHandlers.onLogout()
        return Promise.reject(refreshError)
      }
    }
    
    // Log API errors in development
    if (__DEV__) {
      console.error(`❌ API Error: ${error.response?.status || 'Network'} ${error.config?.url}`, error.message)
      if (error.response?.data) {
        console.error('Server response data:', error.response.data)
      }
      if (error.config?.data) {
        console.error('Request data sent:', error.config.data)
      }
    }
    
    return Promise.reject(error)
  }
)

// Upload GPX file for a ride activity
export interface UploadGPXOptions {
  gpxData: string
  name: string
  activityType: 'bike' | 'foot'
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
  const { gpxData, name, activityType } = options
  
  console.log('🚀 Starting GPX upload...')
  console.log('📝 Upload params:', { name, activityType })
  console.log('📄 GPX data length:', gpxData.length)
  console.log('📄 GPX preview:', gpxData.substring(0, 200) + '...')
  
  // Map our activity types to API expected values
  const apiActivityType = activityType === 'foot' ? 'Foot' : 'Bike'
  console.log('🔄 Mapped activity type:', activityType, '->', apiActivityType)
  
  try {
    // Get auth credentials
    const token = await SecureStore.getItemAsync('token')
    const userId = await SecureStore.getItemAsync('userId')
    console.log('🔑 Auth token:', token ? `Present (${token.substring(0, 10)}...)` : 'Missing')
    console.log('🔑 User ID:', userId ? `Present (${userId})` : 'Missing')
    
    // Create form data as URL-encoded exactly matching original app (fields object in RNFS.uploadFiles)
    const formFields: Record<string, string> = {
      'gpx_activity[file]': gpxData,  // Send GPX XML as string field value, not file
      'gpx_activity[name]': name,
      'gpx_activity[ride_type]': apiActivityType,
    }
    console.log('📦 Form fields to send:', {
      'gpx_activity[file]': `XML string (${gpxData.length} chars)`,
      'gpx_activity[name]': name,
      'gpx_activity[ride_type]': apiActivityType
    })

    // Convert to URL-encoded form data
    const formBody = Object.keys(formFields)
      .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(formFields[key]))
      .join('&')

    console.log('📝 Form body length:', formBody.length)
    console.log('📝 Form body preview:', formBody.substring(0, 300) + '...')

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': token && userId ? `Token token=${token}, id=${userId}` : '',
    }
    console.log('📋 Request headers:', headers)

    const url = `${BASE_URL}${endpoints.postGpxApi}`
    console.log('🎯 Upload URL:', url)

    // Use fetch for the upload
    console.log('📤 Starting URL-encoded upload...')
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formBody,
    })
    
    console.log('📥 Response received:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    })
    
    if (response.ok) {
      const responseData = await response.json() as UploadGPXResponse
      console.log('✅ Upload successful:', responseData)
      return responseData
    } else {
      let errorText = 'No response body'
      try {
        errorText = await response.text()
      } catch (textError) {
        console.warn('Failed to read response text:', textError)
      }
      
      console.error('❌ Upload failed:')
      console.error('Status:', response.status)
      console.error('Status Text:', response.statusText)
      console.error('Response Headers:', Object.fromEntries(response.headers.entries()))
      console.error('Response Body Length:', response.headers.get('content-length'))
      console.error('Response Body Content:', errorText)
      console.error('Response Body (raw):', JSON.stringify(errorText))
      throw new Error(`Upload failed with status ${response.status}: ${errorText}`)
    }
    
  } catch (error) {
    console.error('💥 Exception during upload:', error)
    throw error
  }
}

// Get new miles for tracked points
export interface GetNewMilesResponse {
  unique_length: number
  unique_geometry?: string
  unit?: string
}

export const getNewMiles = async (
  points: [number, number][],
  activityType: 'bike' | 'foot'
): Promise<GetNewMilesResponse> => {
  const response = await api.post<GetNewMilesResponse>(
    `${endpoints.getAthletesApi}match?activity_type=${activityType}&source=app`,
    { points }
  )
  console.log('🔍 New miles response:', response.data)
  return response.data
}

// Get athlete data
export interface AthleteData {
  id: number
  email: string
  name?: string
  first_name?: string
  last_name?: string
  [key: string]: any // Allow for additional properties from API
}

export const getAthlete = async (): Promise<AthleteData> => {
  console.log('📊 Fetching athlete data...')

  try {
    const response = await api.get<AthleteData>(endpoints.getAthletesApi)

    console.log('✅ Athlete data response status:', response.status)
    console.log('📊 Raw athlete data:', response.data)

    return response.data
  } catch (error) {
    console.error('❌ Error fetching athlete data:', error)
    throw error
  }
}

// Get user preferences
export interface UserPreferences {
  [key: string]: any // Flexible structure for preferences
}

export const getPreferences = async (): Promise<UserPreferences> => {
  console.log('⚙️ Fetching user preferences...')

  try {
    const response = await api.get<UserPreferences>(endpoints.getPreferencesApi)

    console.log('✅ Preferences response status:', response.status)
    console.log('⚙️ Raw preferences data:', response.data)

    return response.data
  } catch (error) {
    console.error('❌ Error fetching preferences:', error)
    throw error
  }
}

export default api