import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import colors from '../../styles/colors';
import { component } from '../../styles/spacing';

interface MapControlsProps {
  onGpsPressed: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLayerToggle: () => void;
  onLayersPressed: () => void;
  isTrackingUser: boolean;
  locationMode: number; // 0 = off, 1 = follow, 2 = compass
  mapMode: number; // 0 = normal, 1 = satellite
}

export const MapControls: React.FC<MapControlsProps> = ({
  onGpsPressed,
  onZoomIn,
  onZoomOut,
  onLayerToggle,
  onLayersPressed,
  isTrackingUser,
  locationMode,
  mapMode,
}) => {
  const getGpsIconName = () => {
    switch (locationMode) {
      case 1:
        return 'crosshairs';
      case 2:
        return 'location-arrow';
      default:
        return 'crosshairs';
    }
  };

  const getGpsIconColor = () => {
    return isTrackingUser ? colors.primary.blue : colors.gray500;
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
          <Icon name="plus" size={16} color={colors.gray800} />
        </TouchableOpacity>
        
        <View style={styles.divider} />
        
        <TouchableOpacity
          style={[styles.controlButton, styles.zoomButton]}
          onPress={onZoomOut}
          activeOpacity={0.7}
        >
          <Icon name="minus" size={16} color={colors.gray800} />
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
          color={colors.gray500} 
        />
      </TouchableOpacity>

      {/* Layers Button */}
      <TouchableOpacity
        style={[styles.controlButton, styles.layersButton]}
        onPress={onLayersPressed}
        activeOpacity={0.7}
      >
        <Icon 
          name="layer-group" 
          size={16} 
          color={colors.gray500} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    top: 20,
    alignItems: 'center',
    zIndex: 1000,
  },
  controlButton: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: component.map.controlPadding,
    shadowColor: colors.shadow,
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
    backgroundColor: colors.white,
    borderRadius: 8,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: component.map.controlMargin,
  },
  zoomButton: {
    borderRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray300,
    marginHorizontal: component.map.controlMargin,
  },
  gpsButton: {
    marginBottom: component.map.controlMargin,
  },
  layerButton: {
    marginBottom: component.map.controlMargin,
  },
  layersButton: {
    marginBottom: component.map.controlMargin,
  },
  activeButton: {
    backgroundColor: colors.primary.blueFaint,
  },
});

export default MapControls;