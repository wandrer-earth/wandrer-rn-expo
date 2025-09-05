import { create } from 'zustand'
import { subscribeWithSelector, persist } from 'zustand/middleware'
import * as SecureStore from 'expo-secure-store'
import api from '../services/api'

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
            const response = await api.post('/auth/login', { email, password })
            const { user, token, refreshToken } = response.data
            
            // Store tokens securely
            await SecureStore.setItemAsync('token', token)
            if (refreshToken) {
              await SecureStore.setItemAsync('refreshToken', refreshToken)
            }
            
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false, 
              error: null 
            })
          } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Login failed'
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
          
          // Clear stored tokens
          await SecureStore.deleteItemAsync('token')
          await SecureStore.deleteItemAsync('refreshToken')
          
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
            if (token) {
              // Verify token is still valid by making a test request
              const response = await api.get('/user/me')
              set({ 
                user: response.data, 
                isAuthenticated: true, 
                isLoading: false 
              })
            } else {
              set({ isLoading: false })
            }
          } catch (error) {
            // Token is invalid, clear it
            await SecureStore.deleteItemAsync('token')
            await SecureStore.deleteItemAsync('refreshToken')
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
        partialize: (state) => ({ 
          user: state.user, 
          isAuthenticated: state.isAuthenticated 
        })
      }
    )
  )
)