import React, { useState, useRef, useCallback, useMemo } from "react";
import { View, ViewStyle, StyleSheet } from "react-native";
import { MapView as MapLibreGL, UserLocation, Camera, UserTrackingMode} from "@maplibre/maplibre-react-native";

const MAPTILER_API_KEY = process.env.EXPO_PUBLIC_MAPTILER_API_KEY;
const MAP_MOVE_ANIMATION_TIME = 500;

const normalMap = `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_API_KEY}`;
const satelliteMap = `https://api.maptiler.com/maps/satellite/style.json?key=${MAPTILER_API_KEY}`;

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
  mapMode = 0
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

  const mapViewProps = useMemo(() => ({
    zoomLevel,
    centerCoordinate,
    zoomEnabled: true,
    rotateEnabled: false,
    style: styles.map,
    styleURL: mapMode === 0 ? normalMap : satelliteMap,
    onDidFailLoadingMap: () => console.warn('Map failed to load'),
    onDidFinishLoadingMap: handleFinishLoadingMap,
    onWillStartLoadingMap: () => console.log('Map will start loading'),
    onRegionDidChange: handleRegionChange,
    compassEnabled: locationMode === 2,
  }), [zoomLevel, centerCoordinate, mapMode, handleFinishLoadingMap, handleRegionChange, locationMode]);

  return (
    <View style={[styles.container, style]}>
      <MapLibreGL
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
      </MapLibreGL>
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