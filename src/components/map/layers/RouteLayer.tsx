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
            
            {/* Pause indicators between segments */}
            {routeSegments.map((segment, index) => {
              if (index === 0 || segment.points.length === 0) return null
              const prevSegment = routeSegments[index - 1]
              if (prevSegment.points.length === 0) return null
              
              const pausePoint = prevSegment.points[prevSegment.points.length - 1]
              
              return (
                <MapLibreGL.ShapeSource
                  key={`pause-${index}`}
                  id={`pausePoint-${index}`}
                  shape={{
                    type: 'Feature',
                    geometry: {
                      type: 'Point',
                      coordinates: [pausePoint.longitude, pausePoint.latitude]
                    },
                    properties: {}
                  }}
                >
                  <MapLibreGL.CircleLayer
                    id={`pauseCircle-${index}`}
                    style={{
                      circleRadius: 6,
                      circleColor: '#FFC107',
                      circleStrokeWidth: 2,
                      circleStrokeColor: 'white',
                      circleOpacity: 0.8,
                    }}
                  />
                </MapLibreGL.ShapeSource>
              )
            })}
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