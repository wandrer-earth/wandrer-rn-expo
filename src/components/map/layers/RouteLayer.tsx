import React from 'react'
import MapLibreGL from '@maplibre/maplibre-react-native'
import { useLocationStore } from '../../../stores/locationStore'
import { useRideStore } from '../../../stores/rideStore'

export const RouteLayer: React.FC = () => {
  const { routeSegments } = useLocationStore()
  const { recordingState } = useRideStore()
  
  if (recordingState === 'not_tracking') {
    return null
  }
  
  const hasPoints = routeSegments.some(segment => segment.points.length >= 2)
  if (!hasPoints) {
    return null
  }
  
  const segmentFeatures = routeSegments
    .filter(segment => segment.points.length >= 2)
    .map((segment, index) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: segment.points.map(point => [point.longitude, point.latitude])
      },
      properties: {
        segmentIndex: index
      }
    }))
  
  const routeGeoJSON = {
    type: 'FeatureCollection' as const,
    features: segmentFeatures
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
            lineDasharray: [3, 2],
          }}
        />
      </MapLibreGL.ShapeSource>
      
      {(() => {
        const firstSegment = routeSegments.find(s => s.points.length > 0)
        const lastSegment = [...routeSegments].reverse().find(s => s.points.length > 0)
        
        if (!firstSegment || !lastSegment) return null
        
        const firstPoint = firstSegment.points[0]
        const lastPoint = lastSegment.points[lastSegment.points.length - 1]
        
        return (
          <>
            <MapLibreGL.ShapeSource
              id="routeStartPoint"
              shape={{
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [firstPoint.longitude, firstPoint.latitude]
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
                  coordinates: [lastPoint.longitude, lastPoint.latitude]
                },
                properties: {}
              }}
            >

            </MapLibreGL.ShapeSource>
            
            
          </>
        )
      })()}
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