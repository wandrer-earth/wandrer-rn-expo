import React from 'react'
import { StyleSheet } from 'react-native'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import * as Haptics from 'expo-haptics'
import { useMapSettingsStore } from '../../stores/mapSettingsStore'
import { ACTIVITY_TYPE_OPTIONS } from '../../constants/activityTypes'
import { colors } from '../../styles/colors'
import { fontSize } from '../../styles/typography'

export const ActivityTypeSelect: React.FC = () => {
  const { activityType, setActivityType } = useMapSettingsStore()

  const selectedIndex = ACTIVITY_TYPE_OPTIONS.findIndex(option => option.value === activityType)
  const values = ACTIVITY_TYPE_OPTIONS.map(option => option.label)

  const handleValueChange = (event: any) => {
    const index = event.nativeEvent.selectedSegmentIndex
    const selectedOption = ACTIVITY_TYPE_OPTIONS[index]
    
    if (selectedOption && selectedOption.value !== activityType) {
      Haptics.selectionAsync()
      setActivityType(selectedOption.value)
    }
  }

  return (
    <SegmentedControl
      style={styles.segmentedControl}
      values={values}
      selectedIndex={selectedIndex}
      onChange={handleValueChange}
      tintColor={colors.main}
      backgroundColor={colors.secondarySystemBackground}
      fontStyle={styles.fontStyle}
      activeFontStyle={styles.activeFontStyle}
    />
  )
}

const styles = StyleSheet.create({
  segmentedControl: {
    minWidth: 180,
    height: 32,
  },
  fontStyle: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.gray,
  },
  activeFontStyle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.white,
  },
})