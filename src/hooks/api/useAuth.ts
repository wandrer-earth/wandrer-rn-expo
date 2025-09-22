import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../stores/authStore'
import api, { endpoints } from '../../services/api'

interface LoginCredentials {
  email: string
  password: string
}

interface LoginResponse {
  user: {
    id: number
    email: string
    name?: string
  }
  token: string
  refreshToken?: string
}

// Login mutation
export const useLogin = () => {
  const login = useAuthStore((state) => state.login)
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ email, password }: LoginCredentials) => {
      await login(email, password)
      return { email, password }
    },
    onSuccess: () => {
      // Invalidate any cached queries after login
      queryClient.invalidateQueries()
    },
    onError: (error) => {
      console.error('Login failed:', error)
    }
  })
}

// Logout mutation
export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout)
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      await logout()
    },
    onSuccess: () => {
      // Clear all cached queries after logout
      queryClient.clear()
    }
  })
}

// Get current user query
export const useCurrentUser = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const response = await api.get('/user/me')
      return response.data
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors
      if (error?.response?.status === 401) {
        return false
      }
      return failureCount < 3
    }
  })
}

// Get user preferences
export const useUserPreferences = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  return useQuery({
    queryKey: ['user', 'preferences'],
    queryFn: async () => {
      const response = await api.get(endpoints.getPreferencesApi)
      return response.data
    },
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Get athlete data
export const useAthlete = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  return useQuery({
    queryKey: ['athlete'],
    queryFn: async () => {
      const response = await api.get('/athlete')
      return response.data
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Refresh token mutation
export const useRefreshToken = () => {
  const refreshToken = useAuthStore((state) => state.refreshToken)
  
  return useMutation({
    mutationFn: async () => {
      await refreshToken()
    },
    onError: (error) => {
      console.error('Token refresh failed:', error)
    }
  })
}