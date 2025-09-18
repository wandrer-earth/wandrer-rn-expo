import React, { useEffect, useState } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { TouchableOpacity, Text } from 'react-native'
import * as Linking from 'expo-linking'
import QueryProvider from '../src/providers/QueryProvider'
import { useAuthStore } from '../src/stores/authStore'
import { useAuthSync } from '../src/hooks/useAuthSync'
import { ToastProvider } from '../src/components/Toast'
import { UploadMonitorService } from '../src/services/uploadMonitorService'

function RootLayoutNav() {
  const { isAuthenticated, isLoading, initialize, logout } = useAuthStore()
  const segments = useSegments()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  
  // Sync auth state with user store
  useAuthSync()

  useEffect(() => {
    initialize()
    
    // Small delay to ensure router is mounted
    const timeout = setTimeout(() => setIsMounted(true), 100)
    return () => clearTimeout(timeout)
  }, [initialize])

  // Global deep link handler to intercept logout URLs
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      if (url && (url.includes('wandrerapp://actions/logout') || url.includes('wandrer://actions/logout'))) {
        // Handle logout and prevent router navigation
        logout()
        return true
      }
      return false
    }

    // Intercept initial URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url)
      }
    })

    // Listen for URL changes
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url)
    })

    return () => {
      subscription.remove()
    }
  }, [logout])

  useEffect(() => {
    const uploadMonitor = UploadMonitorService.getInstance()
    
    if (isAuthenticated && !isLoading) {
      // Start upload monitoring service when authenticated
      uploadMonitor.startMonitoring()
    } else {
      // Stop monitoring when not authenticated
      uploadMonitor.stopMonitoring()
    }
  }, [isAuthenticated, isLoading])

  useEffect(() => {
    if (isLoading || !isMounted) return

    const inAuthGroup = segments[0] === '(auth)'

    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)/')
    } else if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/')
    }
  }, [isAuthenticated, isLoading, segments, isMounted])

  if (isLoading) {
    return null // Or a loading screen
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="layers-modal" 
          options={({ navigation }) => ({ 
            presentation: 'modal',
            title: 'Layer Settings',
            headerShown: true,
            contentStyle: {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
            },
          })} 
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  )
}

export default function RootLayout() {
  return (
    <QueryProvider>
      <ToastProvider>
        <RootLayoutNav />
      </ToastProvider>
    </QueryProvider>
  )
}