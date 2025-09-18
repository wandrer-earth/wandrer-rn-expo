import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../src/stores/authStore'

export default function NotFound() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    // Redirect to appropriate screen based on auth state
    if (isAuthenticated) {
      router.replace('/(tabs)/')
    } else {
      router.replace('/(auth)/')
    }
  }, [isAuthenticated])

  return null
}