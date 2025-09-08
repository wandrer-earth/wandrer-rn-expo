import React from 'react'
import { Tabs } from 'expo-router'
import Icon from 'react-native-vector-icons/FontAwesome5'

const colors = {
  main: '#FF6B6B'
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.main,
        tabBarInactiveTintColor: 'gray',
        tabBarShowLabel: false,
        headerTitleStyle: { fontFamily: 'System', fontSize: 18 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Start an Activity',
          tabBarIcon: ({ color, size }) => (
            <Icon name="map" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Icon name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}