import React from 'react'
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'

interface DualColorPickerProps {
  bikeColor: string
  footColor: string
  onBikePress: () => void
  onFootPress: () => void
}

export const DualColorPicker: React.FC<DualColorPickerProps> = ({
  bikeColor,
  footColor,
  onBikePress,
  onFootPress,
}) => {
  const handlePress = (onPress: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => handlePress(onBikePress)}
        style={[
          styles.colorCircle,
          { backgroundColor: bikeColor }
        ]}
        activeOpacity={0.7}
      >
        <Ionicons
          name="bicycle"
          size={20}
          color="#FFFFFF"
          style={styles.icon}
        />
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={() => handlePress(onFootPress)}
        style={[
          styles.colorCircle,
          { backgroundColor: footColor }
        ]}
        activeOpacity={0.7}
      >
        <Ionicons
          name="walk"
          size={20}
          color="#FFFFFF"
          style={styles.icon}
        />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    textAlign: 'center',
  },
})