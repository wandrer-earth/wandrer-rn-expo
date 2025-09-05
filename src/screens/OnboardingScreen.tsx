import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native'
import Onboarding from 'react-native-onboarding-swiper'
// import { useTranslation } from 'react-i18next'

interface OnboardingScreenProps {
  navigation: any
}

// Custom image components for slides
const SlothIcon = () => (
  <View style={styles.imageContainer}>
    <Text style={styles.emoji}>🦥</Text>
  </View>
)

const OnboardingImage = ({ index }: { index: number }) => {
  const images = [
    require('../assets/Onboarding1.png'),
    require('../assets/Onboarding2.png'),
    require('../assets/Onboarding3.png'),
    require('../assets/Onboarding4.png'),
  ]
  
  return (
    <View style={styles.imageContainer}>
      <Image 
        source={images[index]} 
        style={styles.onboardingImage}
        resizeMode="contain"
      />
    </View>
  )
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  // const { t } = useTranslation()
  const t = (key: string) => {
    // Original Wandrer translations
    const translations: { [key: string]: string } = {
      'onboarding.welcome': 'Welcome to Wandrer',
      'onboarding.howItWorks': 'How it works',
      'onboarding.rideMore': 'Ride even more',
      'onboarding.compete': 'Compete',
      'onboarding.descriptions.welcome': "Whether you're in training, or just like to ride for the fun of it, we want to encourage you to get out and experience new roads in your city, state, and beyond.",
      'onboarding.descriptions.howItWorks': "The more you meander, explore, and traverse new roads on your bike, the more points you'll earn.",
      'onboarding.descriptions.rideMore': "Challenges are a great way to add more unique miles to your ride, thus helping you get more points. Earn achievement badges for each one you complete.",
      'onboarding.descriptions.compete': "Be sure to check the leaderboard to see who is in the top, and where you fall in line. Hey, a little healthy competition never hurt anyone."
    }
    return translations[key] || key
  }

  const navigateToLogin = () => {
    navigation.navigate('Login')
  }

  return (
    <Onboarding
      onDone={navigateToLogin}
      onSkip={navigateToLogin}
      pages={[
        {
          backgroundColor: '#fff',
          image: <SlothIcon />,
          title: t('onboarding.welcome'),
          subtitle: t('onboarding.descriptions.welcome'),
        },
        {
          backgroundColor: '#fff',
          image: <OnboardingImage index={1} />,
          title: t('onboarding.howItWorks'),
          subtitle: t('onboarding.descriptions.howItWorks'),
        },
        {
          backgroundColor: '#fff',
          image: <OnboardingImage index={2} />,
          title: t('onboarding.rideMore'),
          subtitle: t('onboarding.descriptions.rideMore'),
        },
        {
          backgroundColor: '#fff',
          image: <OnboardingImage index={3} />,
          title: t('onboarding.compete'),
          subtitle: t('onboarding.descriptions.compete'),
        },
      ]}
      titleStyles={styles.title}
      subTitleStyles={styles.subtitle}
      dotStyle={styles.dot}
      activeDotStyle={styles.activeDot}
      skipLabel="Skip"
      nextLabel="Next"
      doneLabel="Get Started"
      showSkip={true}
      showNext={true}
      showDone={true}
    />
  )
}

const styles = StyleSheet.create({
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    height: 200,
  },
  emoji: {
    fontSize: 120,
  },
  onboardingImage: {
    width: 280,
    height: 200,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    textAlign: 'center',
    fontFamily: 'System',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4A4A4A',
    textAlign: 'center',
    paddingHorizontal: 40,
    fontFamily: 'System',
  },
  dot: {
    backgroundColor: '#FF6B6B',
    opacity: 0.3,
    width: 10,
    height: 10,
  },
  activeDot: {
    backgroundColor: '#FF6B6B',
    opacity: 1,
    width: 10,
    height: 10,
  },
})

export default OnboardingScreen