import React from 'react'
import { Stack } from 'expo-router'
import { fontSize } from '../../src/styles/typography'

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleStyle: { fontFamily: 'System', fontSize: fontSize.lg }
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