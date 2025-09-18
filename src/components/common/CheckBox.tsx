import React from 'react'
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { spacing } from '../../styles/spacing'
import { fontSize } from '../../styles/typography'

interface LabelOptions {
  colors: string[]
  styleMode?: 'solid' | 'dashed'
}

interface CheckBoxProps {
  value: boolean
  onValueChange: (value: boolean) => void
  text: string
  labelOptions?: LabelOptions
  disabled?: boolean
}

export const CheckBox: React.FC<CheckBoxProps> = ({
  value,
  onValueChange,
  text,
  labelOptions,
  disabled = false,
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
        <Ionicons
          name={value ? 'checkbox' : 'checkbox-outline'}
          size={24}
          color={disabled ? '#ccc' : '#007AFF'}
          style={styles.checkbox}
        />
        {renderColorIndicator()}
        <Text style={[styles.text, disabled && styles.disabledText]}>
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: spacing.sm,
  },
  colorIndicator: {
    width: 16,
    height: 3,
    borderRadius: 1.5,
    marginRight: spacing.sm,
  },
  text: {
    fontFamily: 'System',
    fontSize: fontSize.md,
    color: '#000',
  },
  disabledText: {
    color: '#8e8e8e',
  },
})