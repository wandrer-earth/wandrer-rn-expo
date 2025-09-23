import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useKeepAwake } from 'expo-keep-awake'
import * as Location from 'expo-location'
import { MapView } from '../../src/components/map/MapView'
import { LayerDebugOverlay } from '../../src/components/map/LayerDebugOverlay'
import { UnifiedRecordingControls } from '../../src/components/ride'
import { useRideStore } from '../../src/stores/rideStore'
import { useLocationStore } from '../../src/stores/locationStore'
import { LocationService } from '../../src/services/locationService'
import { environment } from '../../src/config/environment'
import colors from '../../src/styles/colors'

export default function MapScreen() {
  useKeepAwake()

  const router = useRouter()
  const [isLoadingLocation, setIsLoadingLocation] = useState(true)
  const [locationError, setLocationError] = useState<string | null>(null)

  const { recordingState } = useRideStore()
  const { currentLocation, setCurrentLocation } = useLocationStore()
  const locationService = LocationService.getInstance()

  useEffect(() => {
    const initializeLocation = async () => {
      try {
        setIsLoadingLocation(true)
        setLocationError(null)

        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') {
          throw new Error('Location permission denied')
        }

        // Get current location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        })

        // Update the store
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          altitude: location.coords.altitude || undefined,
          accuracy: location.coords.accuracy || undefined,
          speed: location.coords.speed || undefined,
          heading: location.coords.heading || undefined,
          timestamp: location.timestamp,
        })

        setIsLoadingLocation(false)
      } catch (error) {
        console.error('Failed to get location:', error)
        setLocationError(error instanceof Error ? error.message : 'Failed to get location')
        setIsLoadingLocation(false)
      }
    }

    initializeLocation()
  }, [setCurrentLocation])

  useEffect(() => {
    return () => {
      if (recordingState !== 'not_tracking') {
        locationService.stopLocationTracking()
      }
    }
  }, [])
  
  const handleShowLayers = () => {
    router.push('/layers-modal')
  }
  

  // Show loading state while getting location
  if (isLoadingLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.blueAct} />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    )
  }

  // Show error state if location failed
  if (locationError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to get your location</Text>
        <Text style={styles.errorDetail}>{locationError}</Text>
      </View>
    )
  }

  // Only render map if we have a location
  if (!currentLocation) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No location available</Text>
      </View>
    )
  }

  const mapCenterCoordinate: [number, number] = [
    currentLocation.longitude,
    currentLocation.latitude
  ]

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        centerCoordinate={mapCenterCoordinate}
        zoomLevel={15}
        onLayersPressed={handleShowLayers}
      />
      <UnifiedRecordingControls />
      {environment.isDevelopment && <LayerDebugOverlay />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sectionBg,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.sectionBg,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.primary.grayDark,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.sectionBg,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary.grayDark,
    textAlign: 'center',
  },
  errorDetail: {
    marginTop: 8,
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
  },
})