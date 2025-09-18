import { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import { useAuthStore } from '../src/stores/authStore'

export default function NotFound() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Small delay to ensure router is mounted
    const timeout = setTimeout(() => setIsMounted(true), 100)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    // Redirect to appropriate screen based on auth state
    const timeout = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/(tabs)/')
      } else {
        router.replace('/(auth)/')
      }
    }, 50)

    return () => clearTimeout(timeout)
  }, [isAuthenticated, isMounted])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  )
}