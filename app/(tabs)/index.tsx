import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useKeepAwake } from 'expo-keep-awake'
import { MapView } from '../../src/components/map/MapView'
import { UnifiedRecordingControls } from '../../src/components/ride'
import { useRideStore } from '../../src/stores/rideStore'
import { useLocationStore } from '../../src/stores/locationStore'
import { LocationService } from '../../src/services/locationService'

export default function MapScreen() {
  useKeepAwake()
  
  const router = useRouter()
  
  const { recordingState } = useRideStore()
  const { currentLocation } = useLocationStore()
  const locationService = LocationService.getInstance()
  
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
  
  const mapCenterCoordinate: [number, number] = currentLocation 
    ? [currentLocation.longitude, currentLocation.latitude]
    : [-122.4194, 37.7749]

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map} 
        onLayersPressed={handleShowLayers}
        centerCoordinate={mapCenterCoordinate}
        zoomLevel={15}
      />
      <UnifiedRecordingControls />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  map: {
    flex: 1,
  },
})