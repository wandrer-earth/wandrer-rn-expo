import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useMapSettingsStore } from '../../stores/mapSettingsStore'
import { useUserStore } from '../../stores/userStore'
import { fontSize } from '../../styles/typography'
import { spacing } from '../../styles/spacing'

export const LayerDebugOverlay = React.memo(() => {
  const {
    activityType,
    traveledLayerChecked,
    untraveledLayerChecked,
    pavedLayerChecked,
    unpavedLayerChecked,
    superUniqueLayerChecked,
    achievementsLayerChecked,
    currentZoom,
    currentCenter,
  } = useMapSettingsStore()
  
  const { user } = useUserStore()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Info</Text>
      <Text style={styles.text}>Zoom: {currentZoom.toFixed(2)}</Text>
      <Text style={styles.text}>Center: [{currentCenter[0].toFixed(4)}, {currentCenter[1].toFixed(4)}]</Text>
      <Text style={styles.text}>User: {user ? 'Logged in' : 'Not logged in'}</Text>
      <Text style={styles.text}>Activity: {activityType}</Text>
      <Text style={styles.text}>Traveled: {traveledLayerChecked ? '✓' : '✗'}</Text>
      <Text style={styles.text}>Untraveled: {untraveledLayerChecked ? '✓' : '✗'}</Text>
      <Text style={styles.text}>Paved: {pavedLayerChecked ? '✓' : '✗'}</Text>
      <Text style={styles.text}>Unpaved: {unpavedLayerChecked ? '✓' : '✗'}</Text>
      <Text style={styles.text}>Super Unique: {superUniqueLayerChecked ? '✓' : '✗'}</Text>
      <Text style={styles.text}>Achievements: {achievementsLayerChecked ? '✓' : '✗'}</Text>
      {user && (
        <>
          <Text style={styles.text}>User ID: {user.id}</Text>
          <Text style={styles.text}>Bike tiles: {user.bike_tiles ? '✓' : '✗'}</Text>
          <Text style={styles.text}>Foot tiles: {user.foot_tiles ? '✓' : '✗'}</Text>
        </>
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: spacing.sm,
    borderRadius: 5,
    zIndex: 1000,
  },
  title: {
    color: 'white',
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  text: {
    color: 'white',
    fontSize: fontSize.xs,
    marginBottom: spacing.xxs,
  },
})