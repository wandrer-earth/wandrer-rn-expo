import React, { useState, useRef } from 'react'
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  Text,
  Dimensions,
  Linking,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { Button } from 'react-native-elements'
// import { useTranslation } from 'react-i18next'

const { width } = Dimensions.get('window')

interface OnboardingScreenProps {
  navigation: any
}

interface PageProps {
  index: number
  t: any
}

const Page: React.FC<PageProps> = ({ index, t }) => {

  const getTitle = (index: number) => {
    switch (index) {
      case 0: return t('onboarding.welcome')
      case 1: return t('onboarding.howItWorks')
      case 2: return t('onboarding.rideMore')
      case 3: return t('onboarding.compete')
      default: return ''
    }
  }

  const getDescription = (index: number) => {
    switch (index) {
      case 0: return t('onboarding.descriptions.welcome')
      case 1: return t('onboarding.descriptions.howItWorks')
      case 2: return t('onboarding.descriptions.rideMore')
      case 3: return t('onboarding.descriptions.compete')
      default: return ''
    }
  }

  return (
    <View style={styles.pageContainer}>
      {index === 0 ? (
        <View style={styles.logoContainer}>
          {/* Replace with your Sloth SVG component if available */}
          <Text style={styles.logoPlaceholder}>🦥</Text>
        </View>
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imageText}>📱</Text>
        </View>
      )}
      <Text style={styles.stepTitle}>
        {getTitle(index)}
      </Text>
      <Text style={styles.stepDescription}>
        {getDescription(index)}
      </Text>
    </View>
  )
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const [currentPage, setCurrentPage] = useState(0)
  const scrollViewRef = useRef<ScrollView>(null)
  
  // const { t } = useTranslation()
  const t = (key: string) => {
    // Temporary mock translations
    const translations: { [key: string]: string } = {
      'onboarding.welcome': 'Welcome to Wandrer',
      'onboarding.howItWorks': 'How It Works',
      'onboarding.rideMore': 'Ride More',
      'onboarding.compete': 'Compete',
      'onboarding.descriptions.welcome': 'Track your cycling adventures and discover new places!',
      'onboarding.descriptions.howItWorks': 'Use GPS to track your rides and map your routes.',
      'onboarding.descriptions.rideMore': 'Challenge yourself to explore new roads and trails.',
      'onboarding.descriptions.compete': 'Compare your progress with other riders worldwide.',
    }
    return translations[key] || key
  }

  const navigateToLogin = () => {
    navigation.navigate('Login')
  }

  const handleSignUp = () => {
    Linking.openURL('https://wandrer.earth/')
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.appTitle}>Wandrer</Text>
        <View style={styles.pagesContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const pageIndex = Math.round(event.nativeEvent.contentOffset.x / width)
              setCurrentPage(pageIndex)
            }}
            scrollEventThrottle={16}
          >
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <View key={i} style={styles.pageWrapper}>
                  <Page index={i} t={t} />
                </View>
              ))}
          </ScrollView>
          <View style={styles.pageIndicatorContainer}>
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.pageIndicator,
                    currentPage === i && styles.activePageIndicator,
                  ]}
                />
              ))}
          </View>
        </View>
        <Button
          title="LOG IN"
          onPress={navigateToLogin}
          buttonStyle={styles.loginButton}
          titleStyle={styles.loginButtonText}
        />
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>
            Don't have a Wandrer account?
          </Text>
          <TouchableOpacity
            onPress={handleSignUp}
            accessible={true}
            accessibilityLabel="Sign up for Wandrer"
            accessibilityRole="link"
          >
            <Text style={styles.signupLink}>
              Sign up here.
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    padding: 15,
    alignItems: 'center',
    flex: 1,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
    color: '#FF6B6B',
  },
  pagesContainer: {
    flex: 1,
    width: '100%',
  },
  pageWrapper: {
    width,
    flex: 1,
  },
  pageIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  pageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
    opacity: 0.3,
    marginHorizontal: 4,
  },
  activePageIndicator: {
    opacity: 1,
    backgroundColor: '#FF6B6B',
  },
  pageContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  logoPlaceholder: {
    fontSize: 120,
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  imageText: {
    fontSize: 80,
  },
  stepTitle: {
    fontFamily: 'System',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 20,
    color: 'black',
    textAlign: 'center',
  },
  stepDescription: {
    fontFamily: 'System',
    height: 160,
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: 15,
    textAlign: 'center',
    color: '#4A4A4A',
  },
  loginButton: {
    backgroundColor: '#FF6B6B',
    marginTop: 50,
    marginBottom: 40,
    width: width - 40,
    height: 44,
    borderRadius: 8,
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  signupContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  signupText: {
    color: '#999999',
    fontFamily: 'System',
    fontSize: 14,
  },
  signupLink: {
    color: '#FF6B6B',
    marginLeft: 5,
    fontFamily: 'System',
    fontWeight: 'bold',
    fontSize: 14,
  },
})

export default OnboardingScreen