import React, { useState, useRef, useEffect } from 'react'
import { View, StyleSheet, Animated, TouchableOpacity, Platform, Alert, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView } from 'react-native'
import { Text, Icon } from 'react-native-elements'
import { RecordingFAB } from './RecordingFAB'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import { ACTIVITY_TYPE_OPTIONS } from '../../constants/activityTypes'
import { colors } from '../../styles/colors'
import { useRideStore } from '../../stores/rideStore'
import { useLocationStore } from '../../stores/locationStore'
import { LocationService } from '../../services/locationService'
import { RideService } from '../../services/rideService'
import { useToast } from '../Toast'
import * as Haptics from 'expo-haptics'
import moment from 'moment'

const CARD_COLLAPSED_HEIGHT = 0
const CARD_EXPANDED_HEIGHT = 220

export const UnifiedRecordingControls: React.FC = () => {
  const { 
    recordingState, 
    startRecording, 
    pauseRecording, 
    resumeRecording, 
    stopRecording, 
    cancelRecording,
    currentRide,
    activityType,
    setActivityType,
    saveRide,
    setRecordingState
  } = useRideStore()
  
  const { totalDistance, currentSpeed } = useLocationStore()
  const locationService = LocationService.getInstance()
  const rideService = RideService.getInstance()
  const { showToast } = useToast()
  
  const [rideName, setRideName] = useState('')
  const [showFinishModal, setShowFinishModal] = useState(false)
  
  const cardHeight = useRef(new Animated.Value(CARD_COLLAPSED_HEIGHT)).current
  const cardOpacity = useRef(new Animated.Value(0)).current
  const fabScale = useRef(new Animated.Value(1)).current
  
  const isRecording = recordingState !== 'not_tracking'
  
  useEffect(() => {
    if (isRecording) {
      Animated.parallel([
        Animated.spring(cardHeight, {
          toValue: CARD_EXPANDED_HEIGHT,
          tension: 50,
          friction: 10,
          useNativeDriver: false,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fabScale, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start()
    } else {
      Animated.parallel([
        Animated.spring(cardHeight, {
          toValue: CARD_COLLAPSED_HEIGHT,
          tension: 50,
          friction: 10,
          useNativeDriver: false,
        }),
        Animated.timing(cardOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fabScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start()
    }
  }, [isRecording, cardHeight, cardOpacity, fabScale])
  
  useEffect(() => {
    if (recordingState === 'finishing') {
      setShowFinishModal(true)
    }
  }, [recordingState])
  
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
    await locationService.startLocationTracking()
  }
  
  const handleStop = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    stopRecording()
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
            cancelRecording()
            await locationService.stopLocationTracking()
            showToast('Ride discarded', 'info')
          }
        }
      ]
    )
  }
  
  const handleFinishRide = async () => {
    if (!rideName.trim()) return
    
    await saveRide(rideName.trim())
    
    if (currentRide) {
      const savedRide = {
        ...currentRide,
        name: rideName.trim(),
        uploadStatus: 'pending' as const,
      } as any
      
      await rideService.saveRideLocally(savedRide)
      
      showToast('Uploading ride...', 'info')
      
      try {
        const response = await rideService.uploadRide(savedRide)
        
        if (response.new_miles !== undefined) {
          showToast(`Upload complete! ${response.new_miles.toFixed(2)}km new miles added!`, 'success', 4000)
        } else {
          showToast('Upload complete!', 'success')
        }
      } catch (error) {
        console.error('Failed to upload ride:', error)
        showToast('Upload failed. Will retry later.', 'error')
      }
    }
    
    setRideName('')
    setShowFinishModal(false)
  }
  
  const formatDuration = (milliseconds: number) => {
    const duration = moment.duration(milliseconds)
    const hours = Math.floor(duration.asHours())
    const minutes = duration.minutes()
    const seconds = duration.seconds()
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  
  const formatDistance = (km: number) => {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`
    }
    return `${km.toFixed(2)}km`
  }
  
  const formatSpeed = (kmh: number) => {
    return `${kmh.toFixed(1)}`
  }
  
  return (
    <>
      {!isRecording && (
        <View style={styles.activityTypeContainer}>
          <SegmentedControl
            style={styles.activitySelector}
            values={ACTIVITY_TYPE_OPTIONS.map(option => option.label)}
            selectedIndex={ACTIVITY_TYPE_OPTIONS.findIndex(option => option.value === activityType)}
            onChange={(event) => {
              const index = event.nativeEvent.selectedSegmentIndex
              const selectedOption = ACTIVITY_TYPE_OPTIONS[index]
              if (selectedOption) {
                Haptics.selectionAsync()
                setActivityType(selectedOption.value)
              }
            }}
            tintColor={colors.main}
            backgroundColor={colors.secondarySystemBackground}
            fontStyle={{
              fontSize: 14,
              fontWeight: '500',
              color: colors.gray,
            }}
            activeFontStyle={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.white,
            }}
          />
        </View>
      )}
      
      <RecordingFAB 
        onPress={handleStart} 
        isVisible={!isRecording}
      />
      
      <Animated.View 
        style={[
          styles.recordingCard,
          {
            height: cardHeight,
            opacity: cardOpacity,
          }
        ]}
        pointerEvents={isRecording ? 'box-none' : 'none'}
      >
        <View style={styles.cardContent}>
          {currentRide && (
            <>
              <View style={styles.activityIndicator}>
                <Icon 
                  name={activityType === 'bike' ? 'directions-bike' : 'directions-walk'} 
                  size={20} 
                  color="#666" 
                />
              </View>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{formatDistance(totalDistance)}</Text>
                  <Text style={styles.statLabel}>Distance</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {formatDuration(currentRide.duration || 0)}
                  </Text>
                  <Text style={styles.statLabel}>Time</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{formatSpeed(currentSpeed)}</Text>
                  <Text style={styles.statLabel}>km/h</Text>
                </View>
                
                {currentRide.newMiles !== undefined && (
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {currentRide.newMiles.toFixed(1)}
                    </Text>
                    <Text style={styles.statLabel}>New km</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.controlsRow}>
                {recordingState === 'tracking' && (
                  <>
                    <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
                      <Icon name="pause" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
                      <Icon name="stop" size={24} color="white" />
                      <Text style={styles.stopButtonText}>Finish</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                      <Icon name="close" size={24} color="white" />
                    </TouchableOpacity>
                  </>
                )}
                
                {recordingState === 'paused' && (
                  <>
                    <TouchableOpacity style={styles.resumeButton} onPress={handleResume}>
                      <Icon name="play-arrow" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
                      <Icon name="stop" size={24} color="white" />
                      <Text style={styles.stopButtonText}>Finish</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                      <Icon name="close" size={24} color="white" />
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
            </>
          )}
        </View>
      </Animated.View>
      
      <Modal
        visible={showFinishModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFinishModal(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Name Your Ride</Text>
            
            <TextInput
              style={styles.nameInput}
              placeholder="Enter ride name"
              value={rideName}
              onChangeText={setRideName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleFinishRide}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowFinishModal(false)
                  setRecordingState('paused')
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton, !rideName.trim() && styles.modalSaveButtonDisabled]}
                onPress={handleFinishRide}
                disabled={!rideName.trim()}
              >
                <Text style={styles.modalSaveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  activityTypeContainer: {
    position: 'absolute',
    bottom: 130,
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  activitySelector: {
    width: 200,
    height: 32,
  },
  recordingCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  cardContent: {
    padding: 20,
    paddingBottom: 16,
  },
  activityIndicator: {
    position: 'absolute',
    top: 16,
    right: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  pauseButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    width: 56,
    height: 56,
    borderRadius: 28,
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
    paddingHorizontal: 24,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6F00',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  stopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  finishingText: {
    fontSize: 16,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#F5F5F5',
  },
  modalCancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  modalSaveButton: {
    backgroundColor: '#FF6F00',
  },
  modalSaveButtonDisabled: {
    opacity: 0.5,
  },
  modalSaveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
})