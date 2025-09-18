import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { View, ViewStyle, StyleSheet, AppState, AppStateStatus } from "react-native";
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
import { useMapStateStore } from "../../stores/mapStateStore";
import { getInitialMapLocation, requestLocationPermission } from "../../utils/mapLocationHelper";
import { useToast } from "../Toast";
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
  centerCoordinate: propsCenterCoordinate,
  zoomLevel: propsZoomLevel,
  initialMapMode,
  uniqueGeometry,
  onLayersPressed
}) => {
  const [trackUser, setTrackUser] = useState(false);
  const [locationMode, setLocationMode] = useState(0); // 0 = off, 1 = follow, 2 = compass
  const [mapInitiallyLoaded, setMapInitiallyLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const userLocation = useRef<any>(null);
  const camera = useRef<any>(null);
  const map = useRef<any>(null);
  const appStateRef = useRef(AppState.currentState);
  const isUserInteracting = useRef(false);
  
  const { user } = useUserStore();
  const { showToast } = useToast();
  const {
    centerCoordinate: storedCenterCoordinate,
    zoomLevel: storedZoomLevel,
    mapMode: storedMapMode,
    lastUpdated,
    isUserPositioned,
    preferences,
    setMapRegion,
    setMapMode,
    setUserLocation,
    resetToUserLocation,
    isStateStale,
  } = useMapStateStore();

  // Determine initial values
  const [mapMode, setMapModeState] = useState(
    initialMapMode !== undefined ? initialMapMode : storedMapMode
  );
  const [centerCoordinate, setCenterCoordinate] = useState(
    propsCenterCoordinate || storedCenterCoordinate
  );
  const [zoomLevel, setZoomLevel] = useState(
    propsZoomLevel || storedZoomLevel
  );

  // Initialize map location on first load
  useEffect(() => {
    const initializeMapLocation = async () => {
      const { alwaysStartAtCurrentLocation } = preferences;
      
      // Check for crash recovery scenario (very recent lastUpdated but app just started)
      const timeSinceLastUpdate = Date.now() - lastUpdated;
      const isCrashRecovery = timeSinceLastUpdate < 60000 && isUserPositioned; // Less than 1 minute
      
      if (isCrashRecovery) {
        showToast('Restored to last position', 'info', 2000);
      }
      
      // Check if saved state is from far location
      const distanceFromUser = useMapStateStore.getState().getDistanceFromUserLocation();
      if (distanceFromUser && distanceFromUser > 1000) { // More than 1000km away
        showToast('Map location is far from your current position', 'warning', 5000);
        // Note: The existing Toast component doesn't support action buttons
        // User can use the GPS button to go to current location
      }
      
      // If always start at current location is enabled or we have stale/no saved state
      if (alwaysStartAtCurrentLocation || isStateStale() || !isUserPositioned) {
        const hasPermission = await requestLocationPermission();
        if (hasPermission) {
          const currentLocation = await getInitialMapLocation();
          if (currentLocation) {
            setUserLocation(currentLocation);
            
            // Override position if preference is set or no valid saved state
            if (!propsCenterCoordinate && (alwaysStartAtCurrentLocation || isStateStale() || !isUserPositioned)) {
              setCenterCoordinate(currentLocation);
              setZoomLevel(12); // Zoom in when showing current location
              setMapRegion({
                centerCoordinate: currentLocation,
                zoomLevel: 12
              }, false);
              
              if (isStateStale()) {
                showToast('Map reset to current location (saved position was outdated)', 'info');
              }
            }
          }
        }
      }
      setIsInitialized(true);
    };

    if (!isInitialized) {
      initializeMapLocation();
    }
  }, []);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const isComingToForeground = 
        appStateRef.current.match(/inactive|background/) && 
        nextAppState === 'active';
      
      const isGoingToBackground = 
        appStateRef.current === 'active' && 
        nextAppState.match(/inactive|background/);

      if (isGoingToBackground && !trackUser) {
        // Save current map state before going to background
        if (map.current) {
          map.current.getCenter().then((center: number[]) => {
            map.current.getZoom().then((zoom: number) => {
              setMapRegion({
                centerCoordinate: center as [number, number],
                zoomLevel: zoom
              }, isUserInteracting.current);
            });
          });
        }
      }
      
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, [trackUser, setMapRegion]);

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
    const newMode = mapMode === 0 ? 1 : 0;
    setMapModeState(newMode);
    setMapMode(newMode);
  }, [mapMode, setMapMode]);

  const handleRegionChange = useCallback(
    async ({ properties }: { properties: { isUserInteraction?: boolean } }) => {
      if (properties?.isUserInteraction) {
        setTrackUser(false);
        setLocationMode(0);
        isUserInteracting.current = true;
        
        // Save the new position after user interaction
        if (map.current && mapInitiallyLoaded) {
          const center = await map.current.getCenter();
          const zoom = await map.current.getZoom();
          
          setCenterCoordinate(center as [number, number]);
          setZoomLevel(zoom);
          
          setMapRegion({
            centerCoordinate: center as [number, number],
            zoomLevel: zoom
          }, true);
        }
      } else {
        isUserInteracting.current = false;
      }
    },
    [mapInitiallyLoaded, setMapRegion]
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
          followUserLocation={trackUser}
          followUserMode={locationMode === 2 ? UserTrackingMode.FollowWithCourse : UserTrackingMode.Follow}
          animationMode="flyTo"
          animationDuration={1000}
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