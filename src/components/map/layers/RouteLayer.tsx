import React from 'react'
import MapLibreGL from '@maplibre/maplibre-react-native'
import { useLocationStore } from '../../../stores/locationStore'
import { useRideStore } from '../../../stores/rideStore'

export const RouteLayer: React.FC = () => {
  const { routePoints } = useLocationStore()
  const { recordingState } = useRideStore()
  
  if (routePoints.length < 2 || recordingState === 'not_tracking') {
    return null
  }
  
  const routeGeoJSON = {
    type: 'Feature' as const,
    geometry: {
      type: 'LineString' as const,
      coordinates: routePoints.map(point => [point.longitude, point.latitude])
    },
    properties: {}
  }
  
  return (
    <>
      <MapLibreGL.ShapeSource id="recordedRoute" shape={routeGeoJSON}>
        <MapLibreGL.LineLayer
          id="recordedRouteLine"
          style={{
            lineColor: '#FF6F00',
            lineWidth: 4,
            lineOpacity: 0.8,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      </MapLibreGL.ShapeSource>
      
      {routePoints.length > 0 && (
        <>
          <MapLibreGL.ShapeSource
            id="routeStartPoint"
            shape={{
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [routePoints[0].longitude, routePoints[0].latitude]
              },
              properties: {}
            }}
          >
            <MapLibreGL.CircleLayer
              id="routeStartCircle"
              style={{
                circleRadius: 8,
                circleColor: '#4CAF50',
                circleStrokeWidth: 3,
                circleStrokeColor: 'white',
              }}
            />
          </MapLibreGL.ShapeSource>
          
          <MapLibreGL.ShapeSource
            id="routeEndPoint"
            shape={{
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [
                  routePoints[routePoints.length - 1].longitude,
                  routePoints[routePoints.length - 1].latitude
                ]
              },
              properties: {}
            }}
          >
            <MapLibreGL.CircleLayer
              id="routeEndCircle"
              style={{
                circleRadius: recordingState === 'tracking' ? 10 : 8,
                circleColor: recordingState === 'paused' ? '#FFC107' : '#FF6F00',
                circleStrokeWidth: 3,
                circleStrokeColor: 'white',
                circleOpacity: recordingState === 'tracking' ? [
                  'interpolate',
                  ['linear'],
                  ['get', 'timestamp'],
                  0, 1,
                  1, 0.3
                ] : 1,
              }}
            />
          </MapLibreGL.ShapeSource>
        </>
      )}
    </>
  )
}

export const RouteLayerConfig = {
  id: 'route',
  name: 'Recording Route',
  component: RouteLayer,
  defaultEnabled: true,
  order: 100,
}