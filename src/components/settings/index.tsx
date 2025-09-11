import React, { useEffect, useState, useRef } from 'react'
import { View, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native'
import WebView from 'react-native-webview'
import { useNavigation } from '@react-navigation/native'
import * as Linking from 'expo-linking'
import { useAuthStore } from '../../stores/authStore'
import { useLogout } from '../../hooks/api/useAuth'
import { BASE_URL } from '../../constants/urls'
import colors from '../../styles/colors'

const SettingsScreen = () => {
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const webViewRef = useRef<WebView>(null)
  const navigation = useNavigation()
  const logoutMutation = useLogout()
  const user = useAuthStore((state) => state.user)
  const getToken = useAuthStore((state) => state.getToken)

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await getToken()
      setToken(storedToken)
    }
    loadToken()
  }, [getToken])

  useEffect(() => {
    const handleDeepLink = (url: string) => {
      if (url && (url.includes('wandrerapp://actions/logout') || url.includes('wandrer://actions/logout'))) {
        logoutMutation.mutate()
      }
    }

    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url)
    })

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url)
      }
    })

    return () => {
      subscription.remove()
    }
  }, [logoutMutation])

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (webViewRef.current) {
        webViewRef.current.reload()
      }
    })

    return unsubscribe
  }, [navigation])

  if (!user || !token) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.main} />
        </View>
      </SafeAreaView>
    )
  }

  const settingsUrl = `${BASE_URL}/athletes/${user.id}/edit?app=1`

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{
          uri: settingsUrl,
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Auth-Token': token,
            'Cookie': `token=${token}`,
          },
        }}
        style={styles.webView}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        sharedCookiesEnabled={true}
        onShouldStartLoadWithRequest={(request) => {
          const { url } = request
          
          if (url.includes('wandrerapp://actions/logout') || url.includes('wandrer://actions/logout')) {
            logoutMutation.mutate()
            return false
          }
          
          if (url.startsWith('http://') || url.startsWith('https://')) {
            return true
          }
          
          Linking.openURL(url)
          return false
        }}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.main} />
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default SettingsScreen