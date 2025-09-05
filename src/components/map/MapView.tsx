import React, { useState, useRef, useCallback, useMemo } from "react";
import { View, ViewStyle, StyleSheet } from "react-native";
import { MapView as MapLibreMapView, UserLocation, Camera, UserTrackingMode } from "@maplibre/maplibre-react-native";

const MAPTILER_API_KEY = process.env.EXPO_PUBLIC_MAPTILER_API_KEY;
const MAP_MOVE_ANIMATION_TIME = 500;

const normalMap = `https://s3.amazonaws.com/wandrer.earth/karoo_style.json`;
const satelliteMap = `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_API_KEY}`;

interface MapViewProps {
  style?: ViewStyle;
  children?: React.ReactNode;
  centerCoordinate?: [number, number];
  zoomLevel?: number;
  mapMode?: number; // 0 = normal, 1 = satellite
}

const MapView = React.memo<MapViewProps>(({
  style,
  children,
  centerCoordinate = [-122.4194, 37.7749], // Default to San Francisco
  zoomLevel = 10,
  mapMode = 0 // Default to satellite view
}) => {
  const [trackUser, setTrackUser] = useState(false);
  const [locationMode, setLocationMode] = useState(0); // 0 = off, 1 = follow, 2 = compass
  const [mapInitiallyLoaded, setMapInitiallyLoaded] = useState(false);
  
  const userLocation = useRef<any>(null);
  const camera = useRef<any>(null);
  const map = useRef<any>(null);

  const handleFinishLoadingMap = useCallback(() => {
    setMapInitiallyLoaded(true);
  }, []);

  const onGpsTapped = useCallback(() => {
    if (!mapInitiallyLoaded) return;
    
    const newLocationMode = (locationMode + 1) % 3;
    setLocationMode(newLocationMode);
    setTrackUser(newLocationMode > 0);

    if (newLocationMode > 0 && userLocation.current) {
      const options = {
        centerCoordinate: [
          userLocation.current.coords.longitude,
          userLocation.current.coords.latitude,
        ],
        zoomLevel: Math.max(zoomLevel, 12),
        animationDuration: MAP_MOVE_ANIMATION_TIME,
      };
      camera.current?.setCamera(options);
    }
  }, [locationMode, mapInitiallyLoaded, zoomLevel]);

  const onZoomChanged = useCallback(
    async (condition: "zoom-in" | "zoom-out") => {
      if (!mapInitiallyLoaded || !map.current) return;

      const zoom = await map.current.getZoom();
      const ops = condition === "zoom-in" ? 1 : -1;
      const updatedZoom = Math.max(1, Math.min(20, zoom + ops));
      const center = await map.current.getCenter();

      const options = {
        centerCoordinate: center,
        zoomLevel: updatedZoom,
        animationDuration: MAP_MOVE_ANIMATION_TIME,
      };
      
      setTrackUser(false);
      setLocationMode(0);
      camera.current?.setCamera(options);
    },
    [mapInitiallyLoaded]
  );

  const handleRegionChange = useCallback(
    async ({ properties }: { properties: { isUserInteraction?: boolean } }) => {
      if (properties?.isUserInteraction) {
        setTrackUser(false);
        setLocationMode(0);
      }
    },
    []
  );

  const mapViewProps = useMemo(() => {
    const selectedStyleURL = mapMode === 0 ? normalMap : satelliteMap;
    console.log(`MapView: Using mapMode=${mapMode}, styleURL=${selectedStyleURL}`);
    
    return {
      zoomLevel,
      centerCoordinate,
      zoomEnabled: true,
      rotateEnabled: false,
      style: styles.map,
      mapStyle: selectedStyleURL,
      onDidFailLoadingMap: () => {
        console.error('Map failed to load');
        console.error('Failed URL:', selectedStyleURL);
      },
      onDidFinishLoadingMap: () => {
        console.log('Map finished loading successfully');
        handleFinishLoadingMap();
      },
      onWillStartLoadingMap: () => {
        console.log('Map will start loading with URL:', selectedStyleURL);
      },
      onRegionDidChange: handleRegionChange,
      compassEnabled: locationMode === 2,
    };
  }, [zoomLevel, centerCoordinate, mapMode, handleFinishLoadingMap, handleRegionChange, locationMode]);

  return (
    <View style={[styles.container, style]}>
      <MapLibreMapView
        {...mapViewProps}
        ref={map}
      >
        {children}
        <UserLocation
          showsUserHeadingIndicator
          visible
          onUpdate={(loc) => (userLocation.current = loc)}
          renderMode="native"
        />
        <Camera
          ref={camera}
          followUserLocation={trackUser}
          followUserMode={locationMode === 2 ? UserTrackingMode.FollowWithCourse : UserTrackingMode.Follow}
          animationMode="flyTo"
          animationDuration={1000}
        />
      </MapLibreMapView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export { MapView };
export default MapView;