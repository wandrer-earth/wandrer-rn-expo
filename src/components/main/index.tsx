import React from 'react'
import { View, StyleSheet } from 'react-native'
import { MapView } from '../map/MapView'

const MapScreen = () => {
  return (
    <View style={styles.container}>
      <MapView style={styles.map} />
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

export default MapScreen