import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useKeepAwake } from 'expo-keep-awake'
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
  

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
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
})