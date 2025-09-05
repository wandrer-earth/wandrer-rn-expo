import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

interface MapControlsProps {
  onGpsPressed: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLayerToggle: () => void;
  isTrackingUser: boolean;
  locationMode: number; // 0 = off, 1 = follow, 2 = compass
  mapMode: number; // 0 = normal, 1 = satellite
}

export const MapControls: React.FC<MapControlsProps> = ({
  onGpsPressed,
  onZoomIn,
  onZoomOut,
  onLayerToggle,
  isTrackingUser,
  locationMode,
  mapMode,
}) => {
  const getGpsIconName = () => {
    switch (locationMode) {
      case 1:
        return 'crosshairs';
      case 2:
        return 'compass';
      default:
        return 'location-arrow';
    }
  };

  const getGpsIconColor = () => {
    return isTrackingUser ? '#007AFF' : '#666';
  };

  return (
    <View style={styles.container}>
      {/* Zoom Controls */}
      <View style={styles.zoomControls}>
        <TouchableOpacity
          style={[styles.controlButton, styles.zoomButton]}
          onPress={onZoomIn}
          activeOpacity={0.7}
        >
          <Icon name="plus" size={16} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.divider} />
        
        <TouchableOpacity
          style={[styles.controlButton, styles.zoomButton]}
          onPress={onZoomOut}
          activeOpacity={0.7}
        >
          <Icon name="minus" size={16} color="#333" />
        </TouchableOpacity>
      </View>

      {/* GPS/Location Button */}
      <TouchableOpacity
        style={[
          styles.controlButton,
          styles.gpsButton,
          isTrackingUser && styles.activeButton
        ]}
        onPress={onGpsPressed}
        activeOpacity={0.7}
      >
        <Icon 
          name={getGpsIconName()} 
          size={18} 
          color={getGpsIconColor()} 
        />
      </TouchableOpacity>

      {/* Layer Toggle Button */}
      <TouchableOpacity
        style={[styles.controlButton, styles.layerButton]}
        onPress={onLayerToggle}
        activeOpacity={0.7}
      >
        <Icon 
          name={mapMode === 0 ? 'satellite' : 'map'} 
          size={16} 
          color="#666" 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    top: 60,
    alignItems: 'center',
    zIndex: 1000,
  },
  controlButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
  },
  zoomControls: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 12,
  },
  zoomButton: {
    borderRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 12,
  },
  gpsButton: {
    marginBottom: 12,
  },
  layerButton: {
    marginBottom: 12,
  },
  activeButton: {
    backgroundColor: '#E3F2FD',
  },
});

export default MapControls;