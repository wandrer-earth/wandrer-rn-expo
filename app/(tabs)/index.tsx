import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { useKeepAwake } from 'expo-keep-awake'
import { MapView } from '../../src/components/map/MapView'
import { RecordingControls, RideStats } from '../../src/components/ride'
import { useRideStore } from '../../src/stores/rideStore'
import { useLocationStore } from '../../src/stores/locationStore'
import { LocationService } from '../../src/services/locationService'

export default function MapScreen() {
  useKeepAwake()
  
  const router = useRouter()
  const [showRecordingOverlays, setShowRecordingOverlays] = useState(false)
  
  const { recordingState, currentRide } = useRideStore()
  const { currentLocation } = useLocationStore()
  const locationService = LocationService.getInstance()
  
  const isRecording = recordingState !== 'not_tracking'
  
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
  
  const handleRecordingToggle = () => {
    setShowRecordingOverlays(!showRecordingOverlays)
  }
  
  const mapCenterCoordinate: [number, number] = currentLocation 
    ? [currentLocation.longitude, currentLocation.latitude]
    : [-122.4194, 37.7749]
  
  const recordingOverlays = (
    <View style={styles.overlay}>
      {currentRide && isRecording && (
        <View style={styles.statsContainer}>
          <RideStats />
        </View>
      )}
      
      <View style={styles.controlsContainer}>
        <RecordingControls />
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map} 
        onLayersPressed={handleShowLayers}
        centerCoordinate={mapCenterCoordinate}
        zoomLevel={15}
        showRecordingOverlays={showRecordingOverlays}
        onRecordingToggle={handleRecordingToggle}
        isRecording={isRecording}
        recordingOverlays={recordingOverlays}
      />
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    pointerEvents: 'box-none',
  },
  statsContainer: {
    marginTop: Platform.OS === 'ios' ? 60 : 80,
    marginHorizontal: 16,
    pointerEvents: 'box-none',
  },
  controlsContainer: {
    marginBottom: 100,
    marginHorizontal: 16,
    pointerEvents: 'box-none',
  },
})