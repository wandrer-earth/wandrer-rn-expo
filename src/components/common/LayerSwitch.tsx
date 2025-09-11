import React from 'react'
import { TouchableOpacity, Text, View, StyleSheet, Switch } from 'react-native'
import * as Haptics from 'expo-haptics'

interface LabelOptions {
  colors: string[]
  styleMode?: 'solid' | 'dashed'
}

interface LayerSwitchProps {
  value: boolean
  onValueChange: (value: boolean) => void
  text: string
  labelOptions?: LabelOptions
  disabled?: boolean
  onColorPress?: () => void
  showColorPicker?: boolean
}

export const LayerSwitch: React.FC<LayerSwitchProps> = ({
  value,
  onValueChange,
  text,
  labelOptions,
  disabled = false,
  onColorPress,
  showColorPicker = false,
}) => {
  const handlePress = () => {
    if (disabled) return
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onValueChange(!value)
  }

  const renderColorIndicator = () => {
    if (!labelOptions?.colors?.length) return null

    const primaryColor = labelOptions.colors[0]
    const isDashed = labelOptions.styleMode === 'dashed'

    return (
      <View style={styles.colorIndicatorContainer}>
        {showColorPicker && onColorPress && (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              onColorPress()
            }}
            style={[
              styles.colorCircle,
              { backgroundColor: primaryColor }
            ]}
            activeOpacity={0.7}
          />
        )}
        <View
          style={[
            styles.colorIndicator,
            {
              backgroundColor: isDashed ? 'transparent' : primaryColor,
              borderColor: primaryColor,
              borderStyle: isDashed ? 'dashed' : 'solid',
              borderWidth: isDashed ? 2 : 0,
            },
          ]}
        />
      </View>
    )
  }

  return (
    <TouchableOpacity 
      onPress={handlePress} 
      disabled={disabled}
      style={[styles.container, disabled && styles.disabled]}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.leftContent}>
          {renderColorIndicator()}
          <Text style={[styles.text, disabled && styles.disabledText]}>
            {text}
          </Text>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{ false: '#E5E5EA', true: '#34C759' }}
          thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
          ios_backgroundColor="#E5E5EA"
        />
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 16,
    height: 3,
    borderRadius: 1.5,
    marginRight: 8,
  },
  colorCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  text: {
    fontFamily: 'System',
    fontSize: 16,
    color: '#000',
  },
  disabledText: {
    color: '#8e8e8e',
  },
})