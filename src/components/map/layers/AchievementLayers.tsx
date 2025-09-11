import React, { useMemo } from 'react'
import MapLibreGL from '@maplibre/maplibre-react-native'
import { SOURCE_LAYERS } from './index'
import { TILE_URL } from '../../../constants/urls'
import { useMapSettingsStore } from '../../../stores/mapSettingsStore'
import { ActivityType } from '../../../constants/activityTypes'

interface AchievementLayersProps {
  mapSettings: ReturnType<typeof useMapSettingsStore.getState>['mapSettings']
}

const calculateLayerStyles = (matchExpression: any[]) => {
  return {
    achievements: {
      fillColor: matchExpression,
      fillOutlineColor: 'transparent',
      fillAntialias: false,
      fillOpacity: ['interpolate', ['linear'], ['zoom'], 9, 0.0, 14, 0.3],
    },
    achievementsOutline: {
      lineColor: matchExpression,
      lineWidth: 2,
      lineOpacity: ['interpolate', ['linear'], ['zoom'], 9, 0.0, 14, 0.5],
    }
  }
}

const calculateAchievementLayers = (achievementIds: number[], activityType: ActivityType) => {
  let matchExpression = ['match', ['get', 'geometry_badge_id']]
  
  if (achievementIds.length === 0) {
    achievementIds = [-1]
  }
  
  // For each achievement ID, we need to provide the ID and its color
  // Since we don't have the color mapping in the current implementation,
  // we'll use a placeholder approach
  const achievementsWithColors: any[] = []
  achievementIds.forEach(id => {
    achievementsWithColors.push(id)
    achievementsWithColors.push('#FF6B6B') // Placeholder color
  })
  
  matchExpression = [...matchExpression, ...achievementsWithColors, '#333333']

  return matchExpression
}

export const AchievementLayers = React.memo(({ mapSettings }: AchievementLayersProps) => {
  const { activityType, achievementIds } = useMapSettingsStore()
  
  const matchExpression = useMemo(() => {
    return calculateAchievementLayers(achievementIds, activityType)
  }, [activityType, achievementIds])

  const layerStyles = useMemo(() => calculateLayerStyles(matchExpression), [matchExpression])

  return (
    <MapLibreGL.VectorSource
      id="achvSource"
      tileUrlTemplates={[`${TILE_URL}/geometries/{z}/{x}/{y}`]}
      maxZoomLevel={9}
    >
      <MapLibreGL.FillLayer
        id="achievements"
        sourceID="achievements"
        sourceLayerID={SOURCE_LAYERS.geometries}
        style={layerStyles.achievements}
      />
      <MapLibreGL.LineLayer
        id="achievements_outline"
        sourceID="achievements"
        sourceLayerID={SOURCE_LAYERS.geometries}
        style={layerStyles.achievementsOutline}
      />
    </MapLibreGL.VectorSource>
  )
})