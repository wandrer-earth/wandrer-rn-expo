import React, { useMemo } from 'react'
import MapLibreGL from '@maplibre/maplibre-react-native'
import { SOURCE_LAYERS } from './index'
import { TILE_URL } from '../../../constants/urls'
import { useMapSettingsStore, AchievementData } from '../../../stores/mapSettingsStore'
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

const calculateAchievementLayers = (achievementData: AchievementData, activityType: ActivityType) => {
  const matchExpression = ['match', ['get', 'geometry_badge_id']]

  const currentActivityAchievements = achievementData[activityType]

  if (currentActivityAchievements.length === 0) {
    return [...matchExpression, -1, '#333333', '#333333']
  }

  const achievementsWithColors: any[] = []
  currentActivityAchievements.forEach(([id, color]) => {
    achievementsWithColors.push(id)
    achievementsWithColors.push(color)
  })

  return [...matchExpression, ...achievementsWithColors, '#333333']
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
        sourceID="achvSource"
        sourceLayerID={SOURCE_LAYERS.geometries}
        style={layerStyles.achievements}
      />
      <MapLibreGL.LineLayer
        id="achievements_outline"
        sourceID="achvSource"
        sourceLayerID={SOURCE_LAYERS.geometries}
        style={layerStyles.achievementsOutline}
      />
    </MapLibreGL.VectorSource>
  )
})