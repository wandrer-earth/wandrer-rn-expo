import React, { useState } from 'react'
import { View, StyleSheet, TextInput, Modal, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import { Text, Button } from 'react-native-elements'
import moment from 'moment'
import { useRideStore } from '../../stores/rideStore'
import { useLocationStore } from '../../stores/locationStore'
import { ActivityTypeSelect } from '../forms/ActivityTypeSelect'
import { RideService } from '../../services/rideService'

export const RideStats: React.FC = () => {
  const { currentRide, recordingState, activityType, setActivityType, saveRide } = useRideStore()
  const { totalDistance, currentSpeed } = useLocationStore()
  const [rideName, setRideName] = useState('')
  const [showFinishModal, setShowFinishModal] = useState(false)
  const rideService = RideService.getInstance()
  
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
      await rideService.saveRideLocally({
        ...currentRide,
        name: rideName.trim(),
      } as any)
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
        <ActivityTypeSelect
          value={activityType}
          onValueChange={setActivityType}
          style={styles.activitySelector}
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
              <Text style={styles.statLabel}>Avg Speed</Text>
              <Text style={styles.statValue}>
                {formatSpeed(currentRide.averageSpeed || 0)}
              </Text>
            </View>
          </View>
          
          {currentRide.newMiles !== undefined && (
            <View style={styles.newMilesContainer}>
              <Text style={styles.newMilesLabel}>New Miles</Text>
              <Text style={styles.newMilesValue}>{currentRide.newMiles.toFixed(2)}km</Text>
            </View>
          )}
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
                onPress={() => setShowFinishModal(false)}
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
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  activitySelector: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  statItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  newMilesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
  },
  newMilesLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  newMilesValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6F00',
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
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#FF6F00',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
})