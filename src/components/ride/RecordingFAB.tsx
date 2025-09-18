import React, { useRef, useEffect } from 'react'
import { TouchableOpacity, StyleSheet, Animated } from 'react-native'
import { Icon } from 'react-native-elements'
import * as Haptics from 'expo-haptics'
import { useLocationStore } from '../../stores/locationStore'
import colors from '../../styles/colors'

interface RecordingFABProps {
  onPress: () => void
  isVisible?: boolean
}

export const RecordingFAB: React.FC<RecordingFABProps> = ({ onPress, isVisible = true }) => {
  const { isGPSActive, gpsAccuracy } = useLocationStore()
  const scaleAnim = useRef(new Animated.Value(1)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  
  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: isVisible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }, [isVisible, opacityAnim])
  
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    )
    
    if (isGPSActive && gpsAccuracy && gpsAccuracy <= 20) {
      pulse.start()
    } else {
      pulse.stop()
      pulseAnim.setValue(1)
    }
    
    return () => pulse.stop()
  }, [isGPSActive, gpsAccuracy, pulseAnim])
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start()
  }
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start()
  }
  
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onPress()
  }
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [
            { scale: Animated.multiply(scaleAnim, pulseAnim) }
          ],
        },
      ]}
      pointerEvents={isVisible ? 'box-none' : 'none'}
    >
      <TouchableOpacity
        style={styles.fab}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Icon name="play-arrow" size={36} color="white" />
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
  fab: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.main,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gpsIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
})