import React, { useState, useRef, useCallback, useMemo } from "react";
import { View, ViewStyle, StyleSheet } from "react-native";
import {
  MapView as MapLibreMapView,
  UserLocation,
  Camera,
  UserTrackingMode,
  Images
} from "@maplibre/maplibre-react-native";
import { MapControls } from "./MapControls";
import { MapLayers } from "./layers";
import { useUserStore } from "../../stores/userStore";
import { useMapSettingsStore } from "../../stores/mapSettingsStore";
// @ts-ignore - Image imports
import bikeIcon from '../../assets/bike_legend.png';
// @ts-ignore - Image imports
import footIcon from '../../assets/foot_legend.png';

const MAPTILER_API_KEY = process.env.EXPO_PUBLIC_MAPTILER_API_KEY;
const MAP_MOVE_ANIMATION_TIME = 500;

const normalMap = `https://s3.amazonaws.com/wandrer.earth/karoo_style.json`;
const satelliteMap = `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_API_KEY}`;

interface MapViewProps {
  style?: ViewStyle;
  children?: React.ReactNode;
  centerCoordinate?: [number, number];
  zoomLevel?: number;
  initialMapMode?: number; // 0 = normal, 1 = satellite
  uniqueGeometry?: any;
  onLayersPressed?: () => void;
}

const MapView = React.memo<MapViewProps>(({
  style,
  children,
  centerCoordinate = [-122.4194, 37.7749],
  zoomLevel = 10,
  initialMapMode = 1, // Default to satellite view
  uniqueGeometry,
  onLayersPressed
}) => {
  const [trackUser, setTrackUser] = useState(false);
  const [locationMode, setLocationMode] = useState(0); // 0 = off, 1 = follow, 2 = compass
  const [mapInitiallyLoaded, setMapInitiallyLoaded] = useState(false);
  const [mapMode, setMapMode] = useState(initialMapMode);
  const [skipNextRegionChange, setSkipNextRegionChange] = useState(true);

  const userLocation = useRef<any>(null);
  const camera = useRef<any>(null);
  const map = useRef<any>(null);

  const { user } = useUserStore();
  const { setCurrentZoom, setCurrentCenter } = useMapSettingsStore();

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

  const onLayerToggle = useCallback(() => {
    setMapMode((prevMode) => prevMode === 0 ? 1 : 0);
  }, []);

  const handleRegionChange = useCallback(
    async ({ properties }: { properties: { isUserInteraction?: boolean } }) => {
      if (properties?.isUserInteraction) {
        setTrackUser(false);
        setLocationMode(0);
      }

      // Skip the first region change which happens before map is properly initialized
      if (skipNextRegionChange) {
        setSkipNextRegionChange(false);
        return;
      }

      if (map.current && mapInitiallyLoaded) {
        try {
          const [currentZoom, currentCenter] = await Promise.all([
            map.current.getZoom(),
            map.current.getCenter()
          ]);

          // Only update if we get valid values (avoid 0 zoom or [0,0] coordinates)
          const isValidZoom = currentZoom > 0.5;
          const isValidCenter = Math.abs(currentCenter[0]) > 0.01 || Math.abs(currentCenter[1]) > 0.01;

          if (isValidZoom && isValidCenter) {
            setCurrentZoom(currentZoom);
            setCurrentCenter(currentCenter);
          }
        } catch (error) {
          console.warn('Failed to get map state:', error);
        }
      }
    },
    [setCurrentZoom, setCurrentCenter, skipNextRegionChange, mapInitiallyLoaded]
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
        setCurrentZoom(zoomLevel);
        setCurrentCenter(centerCoordinate);

        // Explicitly position the camera to the initial coordinates
        if (camera.current) {
          camera.current.setCamera({
            centerCoordinate,
            zoomLevel,
            animationDuration: 0, // No animation for initial positioning
          });
        }
      },
      onWillStartLoadingMap: () => {
        console.log('Map will start loading with URL:', selectedStyleURL);
      },
      onRegionDidChange: handleRegionChange,
      compassEnabled: locationMode === 2,
    };
  }, [zoomLevel, centerCoordinate, mapMode, handleFinishLoadingMap, handleRegionChange, locationMode, setCurrentZoom, setCurrentCenter]);

  return (
    <View style={[styles.container, style]}>
      <MapLibreMapView
        {...mapViewProps}
        ref={map}
      >
        <Images
          images={{
            bike_legend: bikeIcon,
            foot_legend: footIcon,
          }}
        />
        {children}
        {user && <MapLayers userProperties={user} uniqueGeometry={uniqueGeometry} />}
        <UserLocation
          showsUserHeadingIndicator
          visible
          onUpdate={(loc) => (userLocation.current = loc)}
          renderMode="native"
        />
        <Camera
          ref={camera}
          centerCoordinate={centerCoordinate}
          animationDuration={0}
          zoomLevel={zoomLevel}
          followUserLocation={trackUser}
          followUserMode={locationMode === 2 ? UserTrackingMode.FollowWithCourse : UserTrackingMode.Follow}
          animationMode="flyTo"
        />
      </MapLibreMapView>

      <MapControls
        onGpsPressed={onGpsTapped}
        onZoomIn={() => onZoomChanged("zoom-in")}
        onZoomOut={() => onZoomChanged("zoom-out")}
        onLayerToggle={onLayerToggle}
        onLayersPressed={onLayersPressed || (() => {})}
        isTrackingUser={trackUser}
        locationMode={locationMode}
        mapMode={mapMode}
      />
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