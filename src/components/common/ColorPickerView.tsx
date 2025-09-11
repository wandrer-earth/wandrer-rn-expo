import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import colors from '../../styles/colors'

interface ColorPickerViewProps {
  initialColor: string
  activityType: string
  onSave: (color: string) => void
  onCancel: () => void
}

const presetColors = [
  colors.primary.blue,
  colors.primary.pink,
  colors.secondary.green,
  colors.secondary.purple,
  colors.secondary.orange,
  colors.secondary.yellow,
  colors.primary.blueDark,
  colors.primary.pinkDark,
  colors.secondary.greenDark,
  colors.secondary.purpleDark,
  colors.secondary.orangeDark,
  colors.secondary.yellowDark,
  colors.primary.blueLight,
  colors.primary.pinkLight,
  colors.secondary.greenLight,
  colors.secondary.purpleLight,
  colors.secondary.orangeLight,
  colors.secondary.yellowLight,
]

export const ColorPickerView: React.FC<ColorPickerViewProps> = ({
  initialColor,
  activityType,
  onSave,
  onCancel,
}) => {
  const [selectedColor, setSelectedColor] = useState(initialColor)
  const [customHex, setCustomHex] = useState(initialColor)

  const handleColorSelect = (color: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelectedColor(color)
    setCustomHex(color)
  }

  const handleHexChange = (hex: string) => {
    const cleanHex = hex.replace(/[^0-9A-Fa-f]/g, '').substring(0, 6)
    setCustomHex(`#${cleanHex}`)
    if (cleanHex.length === 6) {
      setSelectedColor(`#${cleanHex}`)
    }
  }

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onSave(selectedColor)
  }

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onCancel()
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Choose Color</Text>
          <Text style={styles.headerSubtitle}>{activityType}</Text>
        </View>
        <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.currentColorContainer}>
          <Text style={styles.sectionTitle}>Current Color</Text>
          <View style={[styles.currentColor, { backgroundColor: selectedColor }]} />
        </View>

        <View style={styles.presetSection}>
          <Text style={styles.sectionTitle}>Preset Colors</Text>
          <View style={styles.colorGrid}>
            {presetColors.map((color, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleColorSelect(color)}
                style={[
                  styles.colorItem,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColorItem,
                ]}
                activeOpacity={0.7}
              />
            ))}
          </View>
        </View>

        <View style={styles.customSection}>
          <Text style={styles.sectionTitle}>Custom Color</Text>
          <View style={styles.hexInputContainer}>
            <Text style={styles.hexPrefix}>#</Text>
            <TextInput
              style={styles.hexInput}
              value={customHex.replace('#', '')}
              onChangeText={handleHexChange}
              placeholder="000000"
              placeholderTextColor="#999"
              maxLength={6}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  headerButton: {
    padding: 8,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.secondary.black,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 2,
  },
  cancelText: {
    fontSize: 17,
    color: colors.gray,
  },
  saveText: {
    fontSize: 17,
    color: colors.primary.blue,
    fontWeight: '600',
  },
  content: {
    padding: 22,
  },
  currentColorContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary.black,
    marginBottom: 12,
  },
  currentColor: {
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetSection: {
    marginBottom: 32,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  colorItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    margin: 4,
    borderWidth: 3,
    borderColor: colors.secondary.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedColorItem: {
    borderColor: colors.secondary.black,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  customSection: {
    marginBottom: 32,
  },
  hexInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 50,
  },
  hexPrefix: {
    fontSize: 18,
    color: colors.gray,
    marginRight: 4,
  },
  hexInput: {
    flex: 1,
    fontSize: 18,
    color: colors.secondary.black,
  },
})