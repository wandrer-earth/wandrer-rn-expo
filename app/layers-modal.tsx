import React from 'react'
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { LayerSwitch } from '../src/components/common/LayerSwitch'
import { ActivityTypeSelect } from '../src/components/forms/ActivityTypeSelect'
import { useMapSettingsStore } from '../src/stores/mapSettingsStore'
import { getTraveledColor, getSuntColor, getUntraveledColor } from '../src/utils/colorUtils'
import colors from '../src/styles/colors'

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
  } = useMapSettingsStore()

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.back()
  }

  const pavedLayerColor = getUntraveledColor(mapSettings)

  return (
    <View style={styles.container}>
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
        />

        <LayerSwitch
          value={untraveledLayerChecked}
          onValueChange={setUntraveledLayerChecked}
          labelOptions={{ colors: [pavedLayerColor] }}
          text="Untraveled"
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
          labelOptions={{ colors: [colors.white] }}
          text="Achievements"
        />
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeButtonText}>Done</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    padding: 22,
    paddingTop: 10,
  },
  dragIndicator: {
    backgroundColor: colors.lightGray,
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
    backgroundColor: colors.lightGray,
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
    backgroundColor: colors.white,
  },
  segmentButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray,
  },
  segmentButtonTextActive: {
    color: colors.black,
  },
  closeButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
})