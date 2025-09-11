import { create } from 'zustand'
import { subscribeWithSelector, persist, createJSONStorage } from 'zustand/middleware'
import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api, { endpoints, setAuth } from '../services/api'
import { UserProperties } from './userStore'

const TILE_BASE_URL = 'https://tiles2.wandrer.earth/tiles'

export const createUserProperties = (userId: number): UserProperties => ({
  id: userId,
  bike_tiles: {
    url: `${TILE_BASE_URL}/${userId}/{z}/{x}/{y}`
  },
  foot_tiles: {
    url: `${TILE_BASE_URL}/${userId}/{z}/{x}/{y}`
  },
  combined_bike_tiles: {
    url: `${TILE_BASE_URL}/${userId}/{z}/{x}/{y}`
  },
  combined_foot_tiles: {
    url: `${TILE_BASE_URL}/${userId}/{z}/{x}/{y}`
  }
})

interface User {
  id: number
  email: string
  name?: string
  // Add other user properties based on your API response
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  clearError: () => void
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        login: async (email: string, password: string) => {
          set({ isLoading: true, error: null })
          
          try {
            // Always use real API call - no more mock mode
            // Real API call using Wandrer's format
            const formData = new URLSearchParams()
            formData.append('athlete[email]', email)
            formData.append('athlete[password]', password)
            
            const response = await fetch(`${api.defaults.baseURL}${endpoints.loginApi}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'pragma': 'no-cache',
                'cache-control': 'no-cache',
              },
              credentials: 'omit',
              body: formData.toString(),
            })
            
            if (!response.ok) {
              const errorData = await response.json()
              throw new Error(errorData.error || 'Login failed')
            }
            
            const authData = await response.json()
            console.log('🔐 Login Response:', authData)
            
            const { token, id } = authData
            
            // Store tokens securely and set auth header
            await SecureStore.setItemAsync('token', token)
            await SecureStore.setItemAsync('userId', id.toString())
            setAuth({ token, id })
            
            set({ 
              user: { 
                id, 
                email, 
                name: authData.name || authData.first_name || 'Wandrer User'
              }, 
              isAuthenticated: true, 
              isLoading: false, 
              error: null 
            })
          } catch (error: any) {
            let errorMessage = 'Login failed'
            
            if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
              errorMessage = 'Network error. Please check your internet connection.'
            } else {
              errorMessage = error.message || 'Invalid email or password'
            }
            
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false, 
              error: errorMessage 
            })
            throw error
          }
        },

        logout: async () => {
          set({ isLoading: true })
          
          try {
            // Call logout endpoint if available
            await api.post('/auth/logout')
          } catch (error) {
            // Continue with logout even if API call fails
            console.warn('Logout API call failed:', error)
          }
          
          // Clear stored tokens and auth header
          await SecureStore.deleteItemAsync('token')
          await SecureStore.deleteItemAsync('userId')
          await SecureStore.deleteItemAsync('refreshToken')
          delete api.defaults.headers.common.Authorization
          
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false, 
            error: null 
          })
        },

        refreshToken: async () => {
          try {
            const refreshToken = await SecureStore.getItemAsync('refreshToken')
            if (!refreshToken) {
              throw new Error('No refresh token available')
            }
            
            const response = await api.post('/auth/refresh', { refreshToken })
            const { token, user } = response.data
            
            await SecureStore.setItemAsync('token', token)
            
            if (user) {
              set({ user, isAuthenticated: true, error: null })
            }
            
            return token
          } catch (error) {
            // Refresh failed, logout user
            console.warn('Token refresh failed:', error)
            await get().logout()
            throw error
          }
        },

        clearError: () => {
          set({ error: null })
        },

        initialize: async () => {
          set({ isLoading: true })
          
          try {
            const token = await SecureStore.getItemAsync('token')
            const userId = await SecureStore.getItemAsync('userId')
            
            if (token && userId) {
              // Restore auth header and verify token
              setAuth({ token, id: parseInt(userId) })
              
              try {
                // Verify token is still valid by getting athlete data
                const response = await api.get(endpoints.getAthletesApi)
                const athleteData = response.data
                
                set({ 
                  user: { 
                    id: parseInt(userId), 
                    email: athleteData.email || '', 
                    name: athleteData.name || '' 
                  }, 
                  isAuthenticated: true, 
                  isLoading: false 
                })
              } catch (apiError) {
                // Token is invalid, clear auth
                throw apiError
              }
            } else {
              set({ isLoading: false })
            }
          } catch (error) {
            // Token is invalid, clear it
            await SecureStore.deleteItemAsync('token')
            await SecureStore.deleteItemAsync('userId')
            await SecureStore.deleteItemAsync('refreshToken')
            delete api.defaults.headers.common.Authorization
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false, 
              error: null 
            })
          }
        }
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => AsyncStorage),
        partialize: (state) => ({ 
          user: state.user, 
          isAuthenticated: state.isAuthenticated 
        })
      }
    )
  )
)