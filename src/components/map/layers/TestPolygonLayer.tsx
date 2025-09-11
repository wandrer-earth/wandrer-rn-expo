import React from 'react'
import { ShapeSource, FillLayer } from '@maplibre/maplibre-react-native'

const atlantaPolygon = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature' as const,
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [-84.5, 33.6],  // Southwest
          [-84.2, 33.6],  // Southeast  
          [-84.2, 33.9],  // Northeast
          [-84.5, 33.9],  // Northwest
          [-84.5, 33.6]   // Close polygon
        ]]
      },
      properties: {}
    }
  ]
}

export const TestPolygonLayer = React.memo(() => {
  return (
    <ShapeSource id="test-polygon-source" shape={atlantaPolygon}>
      <FillLayer
        id="test-polygon-layer"
        style={{
          fillColor: '#ff0000',
          fillOpacity: 0.5,
          fillOutlineColor: '#ff0000'
        }}
      />
    </ShapeSource>
  )
})