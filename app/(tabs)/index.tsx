import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { MapView } from '../../src/components/map/MapView'
import { LayersButton } from '../../src/components/main/LayersButton'

export default function MapScreen() {
  const router = useRouter()

  const handleShowLayers = () => {
    router.push('/layers-modal')
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map} />
      <LayersButton onPress={handleShowLayers} />
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