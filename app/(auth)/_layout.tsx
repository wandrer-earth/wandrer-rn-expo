import React from 'react'
import { Stack } from 'expo-router'

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleStyle: { fontFamily: 'System', fontSize: 18 }
      }}
    >
      <Stack.Screen
        name="index"
        options={{ headerShown: false, title: 'Welcome' }}
      />
      <Stack.Screen
        name="login"
        options={{ headerTitle: '', title: 'Login' }}
      />
    </Stack>
  )
}