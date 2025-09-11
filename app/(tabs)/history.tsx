import React, { useEffect, useState } from 'react'
import { 
  View, 
  FlatList, 
  StyleSheet, 
  SafeAreaView, 
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native'
import { Text, Icon, ListItem } from 'react-native-elements'
import moment from 'moment'
import { useRideStore, RideData } from '../../src/stores/rideStore'
import { RideService } from '../../src/services/rideService'

export default function HistoryScreen() {
  const { savedRides, setSavedRides } = useRideStore()
  const [refreshing, setRefreshing] = useState(false)
  const rideService = RideService.getInstance()
  
  useEffect(() => {
    loadRides()
  }, [])
  
  const loadRides = async () => {
    const rides = await rideService.getLocalRides()
    setSavedRides(rides)
  }
  
  const handleRefresh = async () => {
    setRefreshing(true)
    await loadRides()
    await rideService.retryFailedUploads()
    setRefreshing(false)
  }
  
  const handleDeleteRide = (ride: RideData) => {
    Alert.alert(
      'Delete Ride',
      `Are you sure you want to delete "${ride.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await rideService.deleteLocalRide(ride.id)
            await loadRides()
          }
        }
      ]
    )
  }
  
  const getUploadStatusIcon = (status: RideData['uploadStatus']) => {
    switch (status) {
      case 'uploaded':
        return <Icon name="check-circle" type="material" color="#4CAF50" size={20} />
      case 'uploading':
        return <ActivityIndicator size="small" color="#FF6F00" />
      case 'failed':
        return <Icon name="error" type="material" color="#F44336" size={20} />
      default:
        return <Icon name="cloud-upload" type="material" color="#999" size={20} />
    }
  }
  
  const formatDuration = (milliseconds: number) => {
    const duration = moment.duration(milliseconds)
    const hours = Math.floor(duration.asHours())
    const minutes = duration.minutes()
    const seconds = duration.seconds()
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m ${seconds}s`
  }
  
  const renderRide = ({ item }: { item: RideData }) => (
    <ListItem bottomDivider containerStyle={styles.listItem}>
      <View style={styles.activityIcon}>
        <Icon 
          name={item.activityType === 'bike' ? 'bike' : 'walk'} 
          type="font-awesome-5" 
          size={20}
          color="#666"
        />
      </View>
      
      <ListItem.Content>
        <ListItem.Title style={styles.rideName}>{item.name}</ListItem.Title>
        <ListItem.Subtitle style={styles.rideSubtitle}>
          {moment(item.startTime).format('MMM D, YYYY')} • {formatDuration(item.duration)} • {item.distance.toFixed(2)}km
          {item.newMiles !== undefined && ` • ${item.newMiles.toFixed(2)}km new`}
        </ListItem.Subtitle>
      </ListItem.Content>
      
      <View style={styles.rightContent}>
        {getUploadStatusIcon(item.uploadStatus)}
        <TouchableOpacity
          onPress={() => handleDeleteRide(item)}
          style={styles.deleteButton}
        >
          <Icon name="delete" type="material" size={20} color="#999" />
        </TouchableOpacity>
      </View>
    </ListItem>
  )
  
  const sortedRides = [...savedRides].sort((a, b) => 
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  )
  
  return (
    <SafeAreaView style={styles.container}>
      {savedRides.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon 
            name="directions-bike" 
            type="material" 
            size={80} 
            color="#E0E0E0"
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>No rides recorded yet</Text>
          <Text style={styles.emptySubtext}>
            Start recording to see your ride history here
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedRides}
          renderItem={renderRide}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#FF6F00"
            />
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  listItem: {
    backgroundColor: 'white',
    paddingVertical: 16,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rideName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  rideSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    padding: 4,
  },
})