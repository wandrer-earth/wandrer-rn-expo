import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  SafeAreaView,
  TouchableOpacity
} from 'react-native'
import { Icon } from 'react-native-elements'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastMessage {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const animatedValues = useRef<{ [key: string]: Animated.Value }>({})

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = Date.now().toString()
    const newToast: ToastMessage = { id, message, type, duration }
    
    // Create animated value for this toast
    animatedValues.current[id] = new Animated.Value(0)
    
    setToasts(prev => [...prev, newToast])
    
    // Animate in
    Animated.timing(animatedValues.current[id], {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
    
    // Auto dismiss
    setTimeout(() => {
      dismissToast(id)
    }, duration)
  }, [])

  const dismissToast = useCallback((id: string) => {
    if (!animatedValues.current[id]) return
    
    // Animate out
    Animated.timing(animatedValues.current[id], {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
      delete animatedValues.current[id]
    })
  }, [])

  const getToastColor = (type: ToastType) => {
    switch (type) {
      case 'success': return '#4CAF50'
      case 'error': return '#F44336'
      case 'warning': return '#FF9800'
      case 'info': 
      default: return '#2196F3'
    }
  }

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return 'check-circle'
      case 'error': return 'error'
      case 'warning': return 'warning'
      case 'info': 
      default: return 'info'
    }
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <SafeAreaView style={styles.container} pointerEvents="box-none">
        {toasts.map((toast) => {
          const animatedValue = animatedValues.current[toast.id]
          if (!animatedValue) return null
          
          return (
            <Animated.View
              key={toast.id}
              style={[
                styles.toast,
                {
                  backgroundColor: getToastColor(toast.type),
                  opacity: animatedValue,
                  transform: [{
                    translateY: animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-50, 0],
                    }),
                  }],
                },
              ]}
            >
              <Icon
                name={getToastIcon(toast.type)}
                type="material"
                color="white"
                size={24}
                containerStyle={styles.icon}
              />
              <Text style={styles.message}>{toast.message}</Text>
              <TouchableOpacity
                onPress={() => dismissToast(toast.id)}
                style={styles.closeButton}
              >
                <Icon name="close" type="material" color="white" size={20} />
              </TouchableOpacity>
            </Animated.View>
          )
        })}
      </SafeAreaView>
    </ToastContext.Provider>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
  },
})