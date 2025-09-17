import React from 'react'
import { TouchableOpacity, Text, View, StyleSheet, Switch } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'
import colors from '../../styles/colors'

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
  icon?: keyof typeof Ionicons.glyphMap
}

export const LayerSwitch: React.FC<LayerSwitchProps> = ({
  value,
  onValueChange,
  text,
  labelOptions,
  disabled = false,
  onColorPress,
  showColorPicker = false,
  icon,
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
        {showColorPicker && onColorPress ? (
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
          >
            {icon && (
              <Ionicons
                name={icon}
                size={20}
                color={colors.white}
                style={styles.colorCircleIcon}
              />
            )}
          </TouchableOpacity>
        ) : (
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
        )}
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
          trackColor={{ false: colors.separator, true: colors.secondary.green }}
          thumbColor={colors.white}
          ios_backgroundColor={colors.separator}
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
    width: 40,
    height: 40,
    borderRadius: 40,
    marginRight: 8,
    borderWidth: 4,
    borderColor: colors.white,
    shadowColor: colors.shadow,
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
  colorCircleIcon: {
    textAlign: 'center',
  },
  text: {
    fontFamily: 'System',
    fontSize: 16,
    color: colors.secondary.black,
  },
  disabledText: {
    color: colors.secondaryText,
  },
})