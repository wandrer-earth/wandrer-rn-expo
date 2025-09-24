import React, { useState } from 'react'
import { View, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { Icon, Text } from 'react-native-elements'
import { useRideStore } from '../../stores/rideStore'
import { useLocationStore } from '../../stores/locationStore'
import { LocationService } from '../../services/locationService'
import { RideService } from '../../services/rideService'
import { useToast } from '../Toast'
import * as Haptics from 'expo-haptics'
import { fontSize } from '../../styles/typography'
import { spacing } from '../../styles/spacing'

export const RecordingControls: React.FC = () => {
  const { recordingState, startRecording, pauseRecording, resumeRecording, stopRecording, cancelRecording } = useRideStore()
  const { isGPSActive, gpsAccuracy } = useLocationStore()
  const locationService = LocationService.getInstance()
  const { showToast } = useToast()
  
  const handleStart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const { startNewSegment } = useLocationStore.getState()
    startRecording()
    startNewSegment()
    await locationService.startLocationTracking()
  }
  
  const handlePause = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    const { endCurrentSegment } = useLocationStore.getState()
    pauseRecording()
    endCurrentSegment()
    await locationService.stopLocationTracking()
  }
  
  const handleResume = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    const { startNewSegment } = useLocationStore.getState()
    resumeRecording()
    startNewSegment()
    await locationService.startLocationTracking(false)
  }
  
  const handleStop = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    stopRecording()
    locationService.clearAccumulatedData()
    await locationService.stopLocationTracking()
  }
  
  const handleCancel = async () => {
    Alert.alert(
      'Discard Ride?',
      'All ride data will be lost. This cannot be undone.',
      [
        {
          text: 'Keep Recording',
          style: 'cancel'
        },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
            const { clearRoute } = useLocationStore.getState()
            cancelRecording()
            clearRoute()
            locationService.clearAccumulatedData()
            await locationService.stopLocationTracking()
            showToast('Ride discarded', 'info')
          }
        }
      ]
    )
  }
  
  const getGPSStatusColor = () => {
    if (!isGPSActive) return '#E0E0E0'
    if (!gpsAccuracy) return '#FFA500'
    if (gpsAccuracy <= 10) return '#4CAF50'
    if (gpsAccuracy <= 20) return '#FFC107'
    return '#FF5722'
  }
  
  const getGPSStatusText = () => {
    if (!isGPSActive) return 'GPS Off'
    if (!gpsAccuracy) return 'GPS Acquiring...'
    return `GPS ±${Math.round(gpsAccuracy)}m`
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.gpsStatus}>
        <View style={[styles.gpsIndicator, { backgroundColor: getGPSStatusColor() }]} />
        <Text style={styles.gpsText}>{getGPSStatusText()}</Text>
      </View>
      
      <View style={styles.controlsRow}>
        {recordingState === 'not_tracking' && (
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Icon name="play-arrow" size={40} color="white" />
          </TouchableOpacity>
        )}
        
        {recordingState === 'tracking' && (
          <>
            <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
              <Icon name="pause" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
              <Icon name="flag" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Icon name="close" size={30} color="white" />
            </TouchableOpacity>
          </>
        )}
        
        {recordingState === 'paused' && (
          <>
            <TouchableOpacity style={styles.resumeButton} onPress={handleResume}>
              <Icon name="play-arrow" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
              <Icon name="flag" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Icon name="close" size={30} color="white" />
            </TouchableOpacity>
          </>
        )}
        
        {recordingState === 'finishing' && (
          <View style={styles.finishingContainer}>
            <ActivityIndicator size="large" color="#FF6F00" />
            <Text style={styles.finishingText}>Finishing ride...</Text>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  gpsStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  gpsIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  gpsText: {
    fontSize: fontSize.sm,
    color: '#666',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  startButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  pauseButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFC107',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  resumeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  stopButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  cancelButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  finishingContainer: {
    alignItems: 'center',
  },
  finishingText: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    color: '#666',
  },
})