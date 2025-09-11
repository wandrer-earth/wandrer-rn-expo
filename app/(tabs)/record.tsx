import React, { useEffect } from 'react'
import { View, StyleSheet, SafeAreaView, Platform } from 'react-native'
import { useKeepAwake } from 'expo-keep-awake'
import { MapView } from '../../src/components/map'
import { RecordingControls, RideStats } from '../../src/components/ride'
import { useRideStore } from '../../src/stores/rideStore'
import { useLocationStore } from '../../src/stores/locationStore'
import { LocationService } from '../../src/services/locationService'

export default function RecordScreen() {
  useKeepAwake()
  
  const { recordingState, currentRide } = useRideStore()
  const { currentLocation } = useLocationStore()
  const locationService = LocationService.getInstance()
  
  useEffect(() => {
    return () => {
      if (recordingState !== 'not_tracking') {
        locationService.stopLocationTracking()
      }
    }
  }, [])
  
  const mapCenterCoordinate: [number, number] = currentLocation 
    ? [currentLocation.longitude, currentLocation.latitude]
    : [-122.4194, 37.7749]
  
  return (
    <SafeAreaView style={styles.container}>
      <MapView 
        style={styles.map}
        centerCoordinate={mapCenterCoordinate}
        zoomLevel={15}
      />
      
      <View style={styles.overlay}>
        {currentRide && recordingState !== 'not_tracking' && (
          <View style={styles.statsContainer}>
            <RideStats />
          </View>
        )}
        
        <View style={styles.controlsContainer}>
          <RecordingControls />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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