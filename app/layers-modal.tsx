import React, { useState, useRef, useEffect } from 'react'
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Animated } from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { LayerSwitch } from '../src/components/common/LayerSwitch'
import { ActivityTypeSelect } from '../src/components/forms/ActivityTypeSelect'
import { useMapSettingsStore } from '../src/stores/mapSettingsStore'
import { getTraveledColor, getSuntColor, getUntraveledColor } from '../src/utils/colorUtils'
import { ColorPickerView } from '../src/components/common/ColorPickerView'
import { ACTIVITY_TYPES } from '../src/constants/activityTypes'
import colors from '../src/styles/colors'

type ViewMode = 'layers' | 'colorPicker'
type ColorPickerTarget = 'traveled' | 'untraveled'

export default function LayersModal() {
  const router = useRouter()
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
    superUniqueLayerChecked,
    setSuperUniqueLayerChecked,
    achievementsLayerChecked,
    setAchievementsLayerChecked,
    mapSettings,
    setMapSettings,
  } = useMapSettingsStore()

  const [viewMode, setViewMode] = useState<ViewMode>('layers')
  const [selectedActivityType, setSelectedActivityType] = useState(activityType)
  const [colorPickerTarget, setColorPickerTarget] = useState<ColorPickerTarget>('traveled')
  const fadeAnim = useRef(new Animated.Value(1)).current

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.back()
  }

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

            <LayerSwitch
              value={traveledLayerChecked}
              onValueChange={setTraveledLayerChecked}
              labelOptions={{ colors: getTraveledColor(activityType, mapSettings) }}
              text="Traveled"
              showColorPicker={true}
              onColorPress={() => handleColorPress('traveled')}
            />

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
              value={superUniqueLayerChecked}
              onValueChange={setSuperUniqueLayerChecked}
              disabled={!untraveledLayerChecked && !traveledLayerChecked}
              labelOptions={{ colors: getSuntColor(activityType, mapSettings) }}
              text="Super Unique / Never Traveled"
            />

            <LayerSwitch
              value={achievementsLayerChecked}
              onValueChange={setAchievementsLayerChecked}
              labelOptions={{ colors: [colors.secondary.white] }}
              text="Achievements"
            />
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
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
    padding: 22,
    paddingTop: 10,
  },
  dragIndicator: {
    backgroundColor: colors.primary.grayLight,
    height: 4,
    width: 60,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  activityTypeRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityTypeSelectContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  text: {
    fontFamily: 'System',
    fontSize: 16,
    color: colors.gray,
    flex: 1,
  },
  subOptions: {
    paddingLeft: 20,
  },
  segmentContainer: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    height: 32,
    backgroundColor: colors.primary.grayLight,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 20,
    marginBottom: 20,
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
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray,
  },
  segmentButtonTextActive: {
    color: colors.secondary.black,
  },
  closeButton: {
    backgroundColor: colors.primary.blue,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: colors.secondary.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
})