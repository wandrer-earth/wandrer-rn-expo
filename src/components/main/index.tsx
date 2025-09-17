import React from 'react'
import { View, StyleSheet } from 'react-native'
import { MapView } from '../map/MapView'
import { useUniqueGeometryStore } from '../../stores/uniqueGeometryStore'
import colors from '../../styles/colors'

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
    backgroundColor: colors.sectionBg,
  },
  map: {
    flex: 1,
  },
})

export default MapScreen
export { LayersButton } from './LayersButton'