import React from 'react'
import MapLibreGL from '@maplibre/maplibre-react-native'
import { parseMultiLineString } from '../../../utils/geoUtils'
import colors from '../../../styles/colors'

interface UniqueGeometryLayerProps {
  uniqueGeometry?: string
}

export const UniqueGeometryLayer = React.memo(({ uniqueGeometry }: UniqueGeometryLayerProps) => {
  if (!uniqueGeometry) return null

  const geoJSON = parseMultiLineString(uniqueGeometry)

  return (
    <MapLibreGL.ShapeSource id="uniqueGeometrySource" shape={geoJSON}>
      <MapLibreGL.LineLayer
        id="uniqueGeometryLayer"
        style={{
          lineColor: colors.primary.blueAct,
          lineWidth: 8,
          lineOpacity: 0.5,
          lineJoin: 'round',
          lineCap: 'round',
        }}
      />
    </MapLibreGL.ShapeSource>
  )
})