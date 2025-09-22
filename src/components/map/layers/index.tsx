import React from 'react'
import { VectorSource, LineLayer, SymbolLayer } from '@maplibre/maplibre-react-native'
import colors from '../../../styles/colors'
import { ACTIVITY_TYPES } from '../../../constants/activityTypes'
import { AchievementLayers } from './AchievementLayers'
import { UniqueGeometryLayer } from './UniqueGeometryLayer'
import { RouteLayer, RouteLayerConfig } from './RouteLayer'
import { getTraveledColor } from '../../../utils/colorUtils'
import { useMapSettingsStore } from '../../../stores/mapSettingsStore'
import { UserProperties } from '../../../stores/userStore'
// @ts-ignore - Image imports
import bikeIcon from '../../../assets/bike_legend.png'
// @ts-ignore - Image imports
import footIcon from '../../../assets/foot_legend.png'

export const SOURCE_LAYERS = {
  traveled: 'se',
  untraveled: 'missing_segments',
  unique: 'super_unique',
  geometries: 'geometries'
}

const layerStyles = {
  polyline: {
    lineColor: colors.primary.blueAct,
    lineWidth: 2,
    lineOpacity: 0.7,
    lineJoin: 'round' as const,
    lineCap: 'round' as const,
  },
  untravelled: {
    lineColor: colors.secondary.red,
    lineWidth: 2,
    lineOpacity: 0.7,
    lineJoin: 'round' as const,
    lineCap: 'round' as const,
  },
  untravelledDash: {
    lineColor: colors.secondary.red,
    lineWidth: 2,
    lineOpacity: 0.7,
    lineDasharray: [2, 2],
  },
  footLine: {
    lineColor: colors.primary.pinkDark,
    lineWidth: 2,
    lineOpacity: 0.7,
    lineJoin: 'round' as const,
    lineCap: 'round' as const,
  },
  achievements: {
    fillColor: ['get', 'color'],
    fillOutlineColor: 'transparent',
    fillAntialias: false,
    fillOpacity: ['interpolate', ['linear'], ['zoom'], 9, 0.0, 14, 0.3],
  },
  achievementsOutline: {
    lineColor: ['get', 'color'],
    lineWidth: 2,
    lineOpacity: ['interpolate', ['linear'], ['zoom'], 9, 0.0, 14, 0.5],
  },
  bikeSymbol: {
    iconImage: 'bike_legend',
    iconKeepUpright: true,
    iconAllowOverlap: false,
    symbolPlacement: 'line' as const,
    iconSize: ['interpolate', ['linear'], ['zoom'], 11, 0.2, 14, 1.0]
  },
  footSymbol: {
    iconImage: 'foot_legend',
    iconKeepUpright: true,
    iconAllowOverlap: false,
    symbolPlacement: 'line' as const,
    iconSize: ['interpolate', ['linear'], ['zoom'], 11, 0.2, 14, 1.0]
  }
}

const untraveledUrl = (id: string | number, activityType: string) => 
  `https://wandrer.earth/tiles/m2/${id}/${activityType}/{z}/{x}/{y}&f=1`

const neverTraveledFilter = ['all', ['==', ['get', 'never'], true]]

interface LayerProps {
  userProperties: UserProperties
  mapSettings: ReturnType<typeof useMapSettingsStore.getState>['mapSettings']
}

export const BikeTraveledLayer = React.memo(({ userProperties, mapSettings }: LayerProps) => {
  if (!userProperties.bike_tiles) return null
  const traveledColor = getTraveledColor(ACTIVITY_TYPES.BIKE, mapSettings)
  const layerStyle = { ...layerStyles.polyline, lineColor: traveledColor[0] }
  return (
    <VectorSource
      id="atheleteSource"
      tileUrlTemplates={[userProperties.bike_tiles.url]}
      maxZoomLevel={13}
    >
      <LineLayer
        id="travelled_bike"
        sourceID="atheleteSource"
        sourceLayerID={SOURCE_LAYERS.traveled}
        style={layerStyle}
      />
    </VectorSource>
  )
})

export const FootTraveledLayer = React.memo(({ userProperties, mapSettings }: LayerProps) => {
  if (!userProperties.foot_tiles) return null
  const traveledColor = getTraveledColor(ACTIVITY_TYPES.FOOT, mapSettings)
  const layerStyle = { ...layerStyles.footLine, lineColor: traveledColor[0] }
  return (
    <VectorSource
      id="traveled_foot"
      tileUrlTemplates={[userProperties.foot_tiles.url]}
      maxZoomLevel={13}
    >
      <LineLayer
        id="travelled_foot"
        sourceID="traveled_foot"
        sourceLayerID={SOURCE_LAYERS.traveled}
        style={layerStyle}
      />
    </VectorSource>
  )
})

export const FootUntraveledLayerPaved = React.memo(({ userProperties, mapSettings }: LayerProps) => {
  const { id } = userProperties
  const { pavedLayerColor } = mapSettings
  const layerStyle = { ...layerStyles.untravelled, lineColor: pavedLayerColor }
  const tileUrl = untraveledUrl(id, ACTIVITY_TYPES.FOOT)
  return (
    <VectorSource
      id="untraveled_foot_paved"
      tileUrlTemplates={[tileUrl]}
      maxZoomLevel={13}
    >
      <LineLayer
        id="missing_segments_paved_foot"
        sourceID="untraveled_foot_paved"
        sourceLayerID={SOURCE_LAYERS.untraveled}
        style={layerStyle}
        filter={['all', ['==', ['get', 'unpaved'], false]]}
      />
    </VectorSource>
  )
})

export const FootUntraveledLayerUnpaved = React.memo(({ userProperties, mapSettings }: LayerProps) => {
  const { id } = userProperties
  const { pavedLayerColor } = mapSettings
  const layerStyle = { ...layerStyles.untravelledDash, lineColor: pavedLayerColor }
  const tileUrl = untraveledUrl(id, 'foot')
  return (
    <VectorSource
      id="untraveled_foot_unpaved"
      tileUrlTemplates={[tileUrl]}
      maxZoomLevel={13}
    >
      <LineLayer
        id="missing_segments_unpaved_foot"
        sourceID="untraveled_foot_unpaved"
        sourceLayerID={SOURCE_LAYERS.untraveled}
        style={layerStyle}
        filter={['all', ['==', ['get', 'unpaved'], true]]}
      />
    </VectorSource>
  )
})

export const BikeUntraveledLayerPaved = React.memo(({ userProperties, mapSettings }: LayerProps) => {
  const { id } = userProperties
  const { pavedLayerColor } = mapSettings
  const layerStyle = { ...layerStyles.untravelled, lineColor: pavedLayerColor }
  const tileUrl = untraveledUrl(id, ACTIVITY_TYPES.BIKE)
  console.log('BikeUntraveledLayerPaved rendering with URL:', tileUrl)
  return (
    <VectorSource
      id="missingSourcePaved"
      tileUrlTemplates={[tileUrl]}
      maxZoomLevel={13}
    >
      <LineLayer
        id="missing_segments_paved_bike"
        sourceID="missingSourcePaved"
        sourceLayerID={SOURCE_LAYERS.untraveled}
        style={layerStyle}
        filter={['all', ['==', ['get', 'unpaved'], false]]}
      />
    </VectorSource>
  )
})

export const BikeUntraveledLayerUnpaved = React.memo(({ userProperties, mapSettings }: LayerProps) => {
  const { id } = userProperties
  const { pavedLayerColor } = mapSettings
  const layerStyle = { ...layerStyles.untravelledDash, lineColor: pavedLayerColor }
  const tileUrl = untraveledUrl(id, ACTIVITY_TYPES.BIKE)
  console.log('BikeUntraveledLayerUnpaved rendering with URL:', tileUrl)

  return (
    <VectorSource
      id="missingSourceUnpaved"
      tileUrlTemplates={[tileUrl]}
      maxZoomLevel={13}
    >
      <LineLayer
        id="missing_segments_unpaved_bike"
        sourceID="missingSourceUnpaved"
        sourceLayerID={SOURCE_LAYERS.untraveled}
        style={layerStyle}
        filter={['all', ['==', ['get', 'unpaved'], true]]}
      />
    </VectorSource>
  )
})

export const CombinedTraveledLayer = React.memo(({ userProperties, mapSettings }: LayerProps) => {
  if (!userProperties.combined_bike_tiles || !userProperties.combined_foot_tiles) return null
  const bikeTraveledColor = getTraveledColor(ACTIVITY_TYPES.BIKE, mapSettings)
  const footTraveledColor = getTraveledColor(ACTIVITY_TYPES.FOOT, mapSettings)
  const bikeLayerStyle = { ...layerStyles.polyline, lineColor: bikeTraveledColor[0] }
  const footLayerStyle = { ...layerStyles.footLine, lineColor: footTraveledColor[0] }

  return (
    <>
      <VectorSource
        id="bike_combined"
        tileUrlTemplates={[userProperties.combined_bike_tiles.url]}
        maxZoomLevel={13}
      >
        <LineLayer
          id="wandrer-combined-bike-layer"
          sourceID="bike_combined"
          sourceLayerID={SOURCE_LAYERS.traveled}
          style={bikeLayerStyle}
        />
      </VectorSource>
      <VectorSource
        id="foot_combined"
        tileUrlTemplates={[userProperties.combined_foot_tiles.url]}
        maxZoomLevel={13}
      >
        <LineLayer
          id="wandrer-combined-foot-layer"
          sourceID="foot_combined"
          sourceLayerID={SOURCE_LAYERS.traveled}
          style={footLayerStyle}
        />
      </VectorSource>
    </>
  )
})

export const CombinedUntraveledLayerPaved = React.memo(({ userProperties, mapSettings }: LayerProps) => {
  const { id } = userProperties
  const { pavedLayerColor } = mapSettings
  const layerStyle = { ...layerStyles.untravelled, lineColor: pavedLayerColor }

  return (
    <>
      <VectorSource
        id="untraveled_combined_paved"
        tileUrlTemplates={[untraveledUrl(id, 'combined')]}
        maxZoomLevel={13}
      >
        <LineLayer
          id="missing_segments_paved"
          sourceID="untraveled_combined_paved"
          sourceLayerID={SOURCE_LAYERS.untraveled}
          style={layerStyle}
          filter={['all', ['==', ['get', 'unpaved'], false]]}
        />
      </VectorSource>
    </>
  )
})

export const CombinedUntraveledLayerUnpaved = React.memo(({ userProperties, mapSettings }: LayerProps) => {
  const { id } = userProperties
  const { pavedLayerColor } = mapSettings
  const layerStyle = { ...layerStyles.untravelledDash, lineColor: pavedLayerColor }

  return (
    <>
      <VectorSource
        id="untraveled_combined_unpaved"
        tileUrlTemplates={[untraveledUrl(id, 'combined')]}
        maxZoomLevel={13}
      >
        <LineLayer
          id="missing_segments_unpaved"
          sourceID="untraveled_combined_unpaved"
          sourceLayerID={SOURCE_LAYERS.untraveled}
          style={layerStyle}
          filter={['all', ['==', ['get', 'unpaved'], true]]}
        />
      </VectorSource>
    </>
  )
})

interface SymbolLayerProps extends LayerProps {
  pavedLayerChecked: boolean
  unpavedLayerChecked: boolean
}

export const BikeOnlySymbolLayer = React.memo(({ userProperties, pavedLayerChecked, unpavedLayerChecked }: SymbolLayerProps) => {
  const { id } = userProperties

  const bikeOnlyFilter = ['all',
    ['==', ['get', 'bike'], true],
    ['==', ['get', 'foot'], false]
  ]

  const finalFilter = pavedLayerChecked !== unpavedLayerChecked
    ? [...bikeOnlyFilter, pavedLayerChecked
      ? ['==', ['get', 'unpaved'], false]
      : ['!=', ['get', 'unpaved'], false]]
    : bikeOnlyFilter

  return (
    <VectorSource
      id="bike_only_symbol"
      tileUrlTemplates={[untraveledUrl(id, 'combined')]}
      maxZoomLevel={13}
    >
      <SymbolLayer
        id="bike_only_symbols"
        sourceID="bike_only_symbol"
        sourceLayerID={SOURCE_LAYERS.untraveled}
        style={layerStyles.bikeSymbol}
        filter={finalFilter}
      />
    </VectorSource>
  )
})

export const FootOnlySymbolLayer = React.memo(({ userProperties, pavedLayerChecked, unpavedLayerChecked }: SymbolLayerProps) => {
  const { id } = userProperties

  const footOnlyFilter = ['all',
    ['==', ['get', 'foot'], true],
    ['==', ['get', 'bike'], false]
  ]

  const finalFilter = pavedLayerChecked !== unpavedLayerChecked
    ? [...footOnlyFilter, pavedLayerChecked
      ? ['==', ['get', 'unpaved'], false]
      : ['!=', ['get', 'unpaved'], false]]
    : footOnlyFilter

  return (
    <VectorSource
      id="foot_only_symbol"
      tileUrlTemplates={[untraveledUrl(id, 'combined')]}
      maxZoomLevel={13}
    >
      <SymbolLayer
        id="foot_only_symbols"
        sourceID="foot_only_symbol"
        sourceLayerID={SOURCE_LAYERS.untraveled}
        style={layerStyles.footSymbol}
        filter={finalFilter}
      />
    </VectorSource>
  )
})

interface UniqueGeometry {
  [key: string]: any
}

const LayerComponents = {
  [ACTIVITY_TYPES.COMBINED]: {
    Traveled: CombinedTraveledLayer,
    UntraveledPaved: CombinedUntraveledLayerPaved,
    UntraveledUnpaved: CombinedUntraveledLayerUnpaved,
    Achievements: AchievementLayers,
    UniqueGeometryLayer: ({ uniqueGeometry }: { uniqueGeometry?: UniqueGeometry }) => 
      <UniqueGeometryLayer uniqueGeometry={uniqueGeometry} />,
    BikeOnlySymbol: BikeOnlySymbolLayer,
    FootOnlySymbol: FootOnlySymbolLayer,
  },
  [ACTIVITY_TYPES.BIKE]: {
    Traveled: BikeTraveledLayer,
    UntraveledPaved: BikeUntraveledLayerPaved,
    UntraveledUnpaved: BikeUntraveledLayerUnpaved,
    Achievements: AchievementLayers,
    UniqueGeometryLayer: ({ uniqueGeometry }: { uniqueGeometry?: UniqueGeometry }) => 
      <UniqueGeometryLayer uniqueGeometry={uniqueGeometry} />
  },
  [ACTIVITY_TYPES.FOOT]: {
    Traveled: FootTraveledLayer,
    UntraveledPaved: FootUntraveledLayerPaved,
    UntraveledUnpaved: FootUntraveledLayerUnpaved,
    Achievements: AchievementLayers,
    UniqueGeometryLayer: ({ uniqueGeometry }: { uniqueGeometry?: UniqueGeometry }) => 
      <UniqueGeometryLayer uniqueGeometry={uniqueGeometry} />
  }
}

interface MapLayersProps {
  userProperties: UserProperties
  uniqueGeometry?: UniqueGeometry
}

export const MapLayers = React.memo(({
  userProperties,
  uniqueGeometry
}: MapLayersProps) => {
  const {
    activityType,
    traveledLayerChecked,
    untraveledLayerChecked,
    pavedLayerChecked,
    unpavedLayerChecked,
    achievementsLayerChecked,
    mapSettings
  } = useMapSettingsStore()

  const { 
    Traveled, 
    UntraveledPaved, 
    UntraveledUnpaved, 
    Achievements, 
    UniqueGeometryLayer,  // @ts-ignore
    BikeOnlySymbol,   // @ts-ignore
    FootOnlySymbol 
  } = LayerComponents[activityType]

  return (
    <>
      {traveledLayerChecked && <Traveled userProperties={userProperties} mapSettings={mapSettings} />}
      {pavedLayerChecked && <UntraveledPaved userProperties={userProperties} mapSettings={mapSettings} />}
      {unpavedLayerChecked && <UntraveledUnpaved userProperties={userProperties} mapSettings={mapSettings} />}
      {achievementsLayerChecked && <Achievements mapSettings={mapSettings} />}
      {uniqueGeometry && <UniqueGeometryLayer uniqueGeometry={uniqueGeometry} />}
      <RouteLayer />
      {activityType === ACTIVITY_TYPES.COMBINED && untraveledLayerChecked && (
        <>
          <BikeOnlySymbol 
            userProperties={userProperties} 
            mapSettings={mapSettings} 
            pavedLayerChecked={pavedLayerChecked}
            unpavedLayerChecked={unpavedLayerChecked}
          />
          <FootOnlySymbol 
            userProperties={userProperties} 
            mapSettings={mapSettings}
            pavedLayerChecked={pavedLayerChecked}
            unpavedLayerChecked={unpavedLayerChecked}
          />
        </>
      )}
    </>
  )
})

export { RouteLayerConfig }