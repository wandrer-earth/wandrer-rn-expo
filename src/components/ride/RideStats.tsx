import React, { useState } from 'react'
import { View, StyleSheet, TextInput, Modal, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import { Text } from 'react-native-elements'
import moment from 'moment'
import { useRideStore } from '../../stores/rideStore'
import { useLocationStore } from '../../stores/locationStore'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import { ACTIVITY_TYPE_OPTIONS } from '../../constants/activityTypes'
import colors from '../../styles/colors'
import { padding, margin, spacing } from '../../styles/spacing'
import { fontSize } from '../../styles/typography'
import { RideService } from '../../services/rideService'
import { useToast } from '../Toast'
import * as Haptics from 'expo-haptics'

export const RideStats: React.FC = () => {
  const { currentRide, recordingState, activityType, setActivityType, saveRide, setRecordingState } = useRideStore()
  const { totalDistance, currentSpeed } = useLocationStore()
  const [rideName, setRideName] = useState('')
  const [showFinishModal, setShowFinishModal] = useState(false)
  const rideService = RideService.getInstance()
  const { showToast } = useToast()
  
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
    return `${kmh.toFixed(1)} km/h`
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
      
      // Save ride locally first
      await rideService.saveRideLocally(savedRide)
      
      // Automatically upload the ride
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
  
  React.useEffect(() => {
    if (recordingState === 'finishing') {
      setShowFinishModal(true)
    }
  }, [recordingState])
  
  return (
    <View style={styles.container}>
      {recordingState === 'not_tracking' && (
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
            fontSize: fontSize.sm,
            fontWeight: '500',
            color: colors.gray,
          }}
          activeFontStyle={{
            fontSize: fontSize.sm,
            fontWeight: '600',
            color: colors.white,
          }}
        />
      )}
      
      {currentRide && (
        <>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Distance</Text>
              <Text style={styles.statValue}>{formatDistance(totalDistance)}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Time</Text>
              <Text style={styles.statValue}>
                {formatDuration(currentRide.duration || 0)}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Speed</Text>
              <Text style={styles.statValue}>{formatSpeed(currentSpeed)}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Unique Miles</Text>
              <Text style={styles.statValue}>
                {currentRide.newMiles !== undefined ? `${currentRide.newMiles.toFixed(2)}km` : '--'}
              </Text>
            </View>
          </View>
        </>
      )}
      
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
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowFinishModal(false)
                  setRecordingState('paused')
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, !rideName.trim() && styles.saveButtonDisabled]}
                onPress={handleFinishRide}
                disabled={!rideName.trim()}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: padding.card.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  activitySelector: {
    marginBottom: margin.content.lg,
    height: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm,
  },
  statItem: {
    width: '50%',
    paddingHorizontal: spacing.sm,
    marginBottom: margin.content.lg,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.gray500,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.gray800,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.overlay.dark,
    padding: padding.modal.md,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: padding.modal.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    marginBottom: margin.content.lg,
    textAlign: 'center',
  },
  nameInput: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    padding: padding.input.md,
    fontSize: fontSize.md,
    marginBottom: margin.section.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: padding.input.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.sectionBg,
  },
  cancelButtonText: {
    fontSize: fontSize.md,
    color: colors.gray500,
  },
  saveButton: {
    backgroundColor: colors.main,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: fontSize.md,
    color: colors.white,
    fontWeight: '600',
  },
})