import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { ActivityIndicator, View } from 'react-native'

import { useAuthStore } from '../stores/authStore'
import LoginScreen from '../screens/LoginScreen'
import OnboardingScreen from '../screens/OnboardingScreen'

// Placeholder screens - replace with actual screens when migrating
import MapScreen from '../components/main'
import SettingsScreen from '../components/settings'

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()
const AuthStack = createStackNavigator()

const colors = {
  main: '#FF6B6B'
}

// Auth Stack for non-authenticated users
const AuthStackScreen = () => {
  return (
    <AuthStack.Navigator 
      screenOptions={{
        headerTitleStyle: { fontFamily: 'System', fontSize: 18 }
      }}
    >
      <AuthStack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerTitle: '' }}
      />
    </AuthStack.Navigator>
  )
}

// Main Tab Navigator for authenticated users
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: string

          switch (route.name) {
            case 'Map':
              iconName = 'map'
              break
            case 'Activity':
              iconName = 'user-circle'
              break
            case 'Settings':
              iconName = 'cog'
              break
            default:
              iconName = 'circle'
          }

          return <Icon name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: colors.main,
        tabBarInactiveTintColor: 'gray',
        tabBarShowLabel: false,
        headerTitleStyle: { fontFamily: 'System', fontSize: 18 },
      })}
    >
      <Tab.Screen 
        name="Map" 
        component={MapScreen}
        options={{ title: 'Start an Activity' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  )
}

// Main Stack for authenticated users
const MainStackScreen = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Tab"
    >
      <Stack.Screen name="Tab" component={TabNavigator} />
    </Stack.Navigator>
  )
}

// Loading component
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color={colors.main} />
  </View>
)

// Main App Navigator
const AppNavigator = () => {
  const { isAuthenticated, isLoading, initialize } = useAuthStore()

  useEffect(() => {
    // Initialize auth state on app start
    initialize()
  }, [initialize])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStackScreen /> : <AuthStackScreen />}
    </NavigationContainer>
  )
}

export default AppNavigator