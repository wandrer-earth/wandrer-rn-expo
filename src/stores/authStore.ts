import { create } from 'zustand'
import { subscribeWithSelector, persist, createJSONStorage } from 'zustand/middleware'
import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'
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
            // Check if we're in development mode and use mock login
            const isDev = __DEV__ && !process.env.EXPO_PUBLIC_API_URL
            
            if (isDev) {
              // Mock login for development - simulate API delay
              await new Promise(resolve => setTimeout(resolve, 1000))
              
              // Simple mock validation
              if (email === 'demo@wandrer.earth' && password === 'demo123') {
                const mockUser = { 
                  id: 1, 
                  email: email, 
                  name: 'Demo User' 
                }
                const mockToken = 'mock-token-123'
                
                await SecureStore.setItemAsync('token', mockToken)
                
                set({ 
                  user: mockUser, 
                  isAuthenticated: true, 
                  isLoading: false, 
                  error: null 
                })
                return
              } else {
                throw new Error('Invalid credentials. Try demo@wandrer.earth / demo123')
              }
            }
            
            // Real API call
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
            let errorMessage = 'Login failed'
            
            if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
              errorMessage = 'Network error. Using mock login for development.'
              // Fall back to mock login in development
              if (__DEV__) {
                errorMessage = 'Development mode: Use demo@wandrer.earth / demo123'
              }
            } else {
              errorMessage = error.response?.data?.message || error.message || 'Login failed'
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
              const isDev = __DEV__ && !process.env.EXPO_PUBLIC_API_URL
              
              if (isDev && token === 'mock-token-123') {
                // Mock user for development
                const mockUser = { 
                  id: 1, 
                  email: 'demo@wandrer.earth', 
                  name: 'Demo User' 
                }
                set({ 
                  user: mockUser, 
                  isAuthenticated: true, 
                  isLoading: false 
                })
                return
              }
              
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
        storage: createJSONStorage(() => AsyncStorage),
        partialize: (state) => ({ 
          user: state.user, 
          isAuthenticated: state.isAuthenticated 
        })
      }
    )
  )
)