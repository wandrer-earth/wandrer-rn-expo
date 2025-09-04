import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';

MapLibreGL.setAccessToken(null);

interface MapViewProps {
  style?: any;
}

export const MapView: React.FC<MapViewProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <MapLibreGL.MapView
        style={styles.map}
        styleURL="https://demotiles.maplibre.org/style.json"
      >
        <MapLibreGL.Camera
          centerCoordinate={[-122.4194, 37.7749]} // San Francisco
          zoomLevel={10}
          animationMode="flyTo"
          animationDuration={0}
        />
      </MapLibreGL.MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default MapView;