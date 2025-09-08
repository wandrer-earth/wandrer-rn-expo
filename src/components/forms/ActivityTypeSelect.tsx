import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import * as Haptics from 'expo-haptics'
import { useMapSettingsStore } from '../../stores/mapSettingsStore'
import { ActivityType, ACTIVITY_TYPE_OPTIONS } from '../../constants/activityTypes'

export const ActivityTypeSelect: React.FC = () => {
  const { activityType, setActivityType } = useMapSettingsStore()

  const handleActivityTypeChange = (itemValue: ActivityType) => {
    Haptics.selectionAsync()
    setActivityType(itemValue)
  }

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={activityType}
        onValueChange={handleActivityTypeChange}
        style={styles.picker}
        mode="dropdown"
      >
        {ACTIVITY_TYPE_OPTIONS.map((option) => (
          <Picker.Item
            key={option.value}
            label={option.label}
            value={option.value}
          />
        ))}
      </Picker>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    minWidth: 120,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  picker: {
    height: 40,
  },
})