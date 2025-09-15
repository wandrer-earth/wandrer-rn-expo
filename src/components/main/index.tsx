import React from 'react'
import { View, StyleSheet } from 'react-native'
import { MapView } from '../map/MapView'
import { useUniqueGeometryStore } from '../../stores/uniqueGeometryStore'

const MapScreen = () => {
  const { uniqueGeometry } = useUniqueGeometryStore()
  
  return (
    <View style={styles.container}>
      <MapView style={styles.map} uniqueGeometry={uniqueGeometry} />
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
export { LayersButton } from './LayersButton'