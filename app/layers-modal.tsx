import React, { useState, useRef, useEffect } from 'react'
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Animated, Switch } from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { LayerSwitch } from '../src/components/common/LayerSwitch'
import { ActivityTypeSelect } from '../src/components/forms/ActivityTypeSelect'
import { useMapSettingsStore } from '../src/stores/mapSettingsStore'
import { getTraveledColor, getSuntColor, getUntraveledColor } from '../src/utils/colorUtils'
import { ColorPickerView } from '../src/components/common/ColorPickerView'
import { DualColorPicker } from '../src/components/common/DualColorPicker'
import { ACTIVITY_TYPES } from '../src/constants/activityTypes'
import colors from '../src/styles/colors'
import { fontSize } from '../src/styles/typography'
import { spacing } from '../src/styles/spacing'

type ViewMode = 'layers' | 'colorPicker'
type ColorPickerTarget = 'traveled' | 'untraveled' | 'traveled-bike' | 'traveled-foot'

export default function LayersModal() {
  const {
    activityType,
    traveledLayerChecked,
    setTraveledLayerChecked,
    untraveledLayerChecked,
    setUntraveledLayerChecked,
    pavedLayerChecked,
    setPavedLayerChecked,
    unpavedLayerChecked,
    setUnpavedLayerChecked,
    achievementsLayerChecked,
    setAchievementsLayerChecked,
    mapSettings,
    setMapSettings,
  } = useMapSettingsStore()

  const [viewMode, setViewMode] = useState<ViewMode>('layers')
  const [selectedActivityType, setSelectedActivityType] = useState(activityType)
  const [colorPickerTarget, setColorPickerTarget] = useState<ColorPickerTarget>('traveled')
  const fadeAnim = useRef(new Animated.Value(1)).current


  const pavedLayerColor = getUntraveledColor(mapSettings)

  const handleColorPress = (target: ColorPickerTarget = 'traveled') => {
    setSelectedActivityType(activityType)
    setColorPickerTarget(target)
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setViewMode('colorPicker')
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start()
    })
  }

  const handleColorSave = (color: string) => {
    if (colorPickerTarget === 'untraveled') {
      setMapSettings({ pavedLayerColor: color })
    } else if (colorPickerTarget === 'traveled-bike') {
      setMapSettings({ bikeLayerColor: color })
    } else if (colorPickerTarget === 'traveled-foot') {
      setMapSettings({ footLayerColor: color })
    } else {
      if (activityType === ACTIVITY_TYPES.BIKE || activityType === ACTIVITY_TYPES.COMBINED) {
        setMapSettings({ bikeLayerColor: color })
      } else if (activityType === ACTIVITY_TYPES.FOOT) {
        setMapSettings({ footLayerColor: color })
      }
    }

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setViewMode('layers')
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start()
    })
  }

  const handleColorCancel = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setViewMode('layers')
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start()
    })
  }

  const getInitialColor = () => {
    if (colorPickerTarget === 'untraveled') {
      return mapSettings.pavedLayerColor
    } else if (colorPickerTarget === 'traveled-bike') {
      return mapSettings.bikeLayerColor
    } else if (colorPickerTarget === 'traveled-foot') {
      return mapSettings.footLayerColor
    }
    
    if (activityType === ACTIVITY_TYPES.BIKE || activityType === ACTIVITY_TYPES.COMBINED) {
      return mapSettings.bikeLayerColor
    } else if (activityType === ACTIVITY_TYPES.FOOT) {
      return mapSettings.footLayerColor
    }
    return colors.primary.blue
  }

  const getActivityTypeLabel = () => {
    if (colorPickerTarget === 'untraveled') {
      return 'Untraveled'
    } else if (colorPickerTarget === 'traveled-bike') {
      return 'Bike'
    } else if (colorPickerTarget === 'traveled-foot') {
      return 'Foot'
    }
    
    switch (activityType) {
      case ACTIVITY_TYPES.BIKE:
        return 'Bike'
      case ACTIVITY_TYPES.FOOT:
        return 'Foot'
      case ACTIVITY_TYPES.COMBINED:
        return 'Combined (Primary)'
      default:
        return 'Activity'
    }
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.animatedContent, { opacity: fadeAnim }]}>
        {viewMode === 'layers' ? (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.dragIndicator} />
            
            <View style={styles.activityTypeRow}>
              <Text style={styles.text}>Activity Type</Text>
              <View style={styles.activityTypeSelectContainer}>
                <ActivityTypeSelect />
              </View>
            </View>

            {activityType === ACTIVITY_TYPES.COMBINED ? (
              <View style={styles.layerSwitchRow}>
                <View style={styles.layerSwitchContent}>
                  <TouchableOpacity 
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      setTraveledLayerChecked(!traveledLayerChecked)
                    }}
                    style={styles.layerText}
                    activeOpacity={0.7}
                  >
                    <DualColorPicker
                      bikeColor={mapSettings.bikeLayerColor}
                      footColor={mapSettings.footLayerColor}
                      onBikePress={() => handleColorPress('traveled-bike')}
                      onFootPress={() => handleColorPress('traveled-foot')}
                    />
                    <Text style={styles.text}>Traveled</Text>
                  </TouchableOpacity>
                  <Switch
                    value={traveledLayerChecked}
                    onValueChange={setTraveledLayerChecked}
                    trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                    thumbColor={traveledLayerChecked ? '#FFFFFF' : '#FFFFFF'}
                    ios_backgroundColor="#E5E5EA"
                  />
                </View>
              </View>
            ) : (
              <LayerSwitch
                value={traveledLayerChecked}
                onValueChange={setTraveledLayerChecked}
                labelOptions={{ colors: getTraveledColor(activityType, mapSettings) }}
                text="Traveled"
                showColorPicker={true}
                onColorPress={() => handleColorPress('traveled')}
                icon={activityType === ACTIVITY_TYPES.BIKE ? 'bicycle' : activityType === ACTIVITY_TYPES.FOOT ? 'walk' : undefined}
              />
            )}

            <LayerSwitch
              value={untraveledLayerChecked}
              onValueChange={setUntraveledLayerChecked}
              labelOptions={{ colors: [pavedLayerColor] }}
              text="Untraveled"
              showColorPicker={true}
              onColorPress={() => handleColorPress('untraveled')}
            />

            {untraveledLayerChecked && (
              <View style={styles.subOptions}>
                <LayerSwitch
                  value={pavedLayerChecked}
                  onValueChange={setPavedLayerChecked}
                  labelOptions={{ colors: [pavedLayerColor] }}
                  text="Paved"
                />
                <LayerSwitch
                  value={unpavedLayerChecked}
                  onValueChange={setUnpavedLayerChecked}
                  labelOptions={{ colors: [pavedLayerColor], styleMode: 'dashed' }}
                  text="Unpaved"
                />
              </View>
            )}

            <LayerSwitch
              value={achievementsLayerChecked}
              onValueChange={setAchievementsLayerChecked}
              labelOptions={{ colors: [colors.secondary.white] }}
              text="Achievements"
            />
          </ScrollView>
        ) : (
          <ColorPickerView
            initialColor={getInitialColor()}
            activityType={getActivityTypeLabel()}
            onSave={handleColorSave}
            onCancel={handleColorCancel}
          />
        )}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  animatedContent: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  dragIndicator: {
    backgroundColor: colors.primary.grayLight,
    height: 4,
    width: 60,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  activityTypeRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  activityTypeSelectContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  text: {
    fontFamily: 'System',
    fontSize: fontSize.md,
    color: colors.gray,
    flex: 1,
  },
  subOptions: {
    paddingLeft: spacing.xl,
  },
  segmentContainer: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    height: 32,
    backgroundColor: colors.primary.grayLight,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  segmentButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  segmentButtonLeft: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  segmentButtonRight: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  segmentButtonActive: {
    backgroundColor: colors.secondary.white,
  },
  segmentButtonText: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.gray,
  },
  segmentButtonTextActive: {
    color: colors.secondary.black,
  },
  layerSwitchRow: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  layerSwitchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  layerText: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
})