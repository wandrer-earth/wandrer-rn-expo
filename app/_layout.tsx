import React, { useEffect, useState } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import QueryProvider from '../src/providers/QueryProvider'
import { useAuthStore } from '../src/stores/authStore'

function RootLayoutNav() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore()
  const segments = useSegments()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    initialize()
    // Small delay to ensure router is mounted
    const timeout = setTimeout(() => setIsMounted(true), 100)
    return () => clearTimeout(timeout)
  }, [initialize])

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
          options={{ 
            presentation: 'modal',
            title: 'Layer Settings',
            headerShown: true,
          }} 
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  )
}

export default function RootLayout() {
  return (
    <QueryProvider>
      <RootLayoutNav />
    </QueryProvider>
  )
}