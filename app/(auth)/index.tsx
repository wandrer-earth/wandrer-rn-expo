import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native'
import Onboarding from 'react-native-onboarding-swiper'
import { useRouter } from 'expo-router'
import colors from '../../src/styles/colors'
import { margin, spacing } from '../../src/styles/spacing'
import { fontSize, component } from '../../src/styles/typography'

// Custom image components for slides
const SlothIcon = () => (
  <View style={styles.imageContainer}>
    <Text style={styles.emoji}>🦥</Text>
  </View>
)

const OnboardingImage = ({ index }: { index: number }) => {
  const images = [
    require('../../src/assets/Onboarding1.png'),
    require('../../src/assets/Onboarding2.png'),
    require('../../src/assets/Onboarding3.png'),
    require('../../src/assets/Onboarding4.png'),
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

export default function OnboardingScreen() {
  const router = useRouter()
  
  const t = (key: string) => {
    // Original Wandrer translations
    const translations: { [key: string]: string } = {
      'onboarding.welcome': 'Welcome to Wandrer',
      'onboarding.howItWorks': 'How it works',
      'onboarding.rideMore': 'Ride even more',
      'onboarding.compete': 'Compete',
      'onboarding.descriptions.welcome': "Whether you're in training, or just like to get active for the fun of it, we want to encourage you to get out and experience new roads in your city, state, and beyond.",
      'onboarding.descriptions.howItWorks': "The more you meander, explore, and traverse new roads on your bike, the more points you'll earn.",
      'onboarding.descriptions.rideMore': "Challenges are a great way to add more unique miles to your activity, thus helping you get more points. Earn achievement badges for each one you complete.",
      'onboarding.descriptions.compete': "Be sure to check the leaderboard to see who is in the top, and where you fall in line. Hey, a little healthy competition never hurt anyone."
    }
    return translations[key] || key
  }

  const navigateToLogin = () => {
    router.push('/(auth)/login')
  }

  return (
    <Onboarding
      onDone={navigateToLogin}
      onSkip={navigateToLogin}
      pages={[
        {
          backgroundColor: colors.white,
          image: <SlothIcon />,
          title: t('onboarding.welcome'),
          subtitle: t('onboarding.descriptions.welcome'),
        },
        {
          backgroundColor: colors.white,
          image: <OnboardingImage index={1} />,
          title: t('onboarding.howItWorks'),
          subtitle: t('onboarding.descriptions.howItWorks'),
        },
        {
          backgroundColor: colors.white,
          image: <OnboardingImage index={2} />,
          title: t('onboarding.rideMore'),
          subtitle: t('onboarding.descriptions.rideMore'),
        },
        {
          backgroundColor: colors.white,
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
    marginBottom: margin.section.md,
    height: 200,
  },
  emoji: {
    fontSize: fontSize.xxxxl * 3.75, // 120px (maintains current size)
  },
  onboardingImage: {
    width: 280,
    height: 200,
  },
  title: {
    ...component.onboarding.title,
    color: colors.main,
    textAlign: 'center',
    fontFamily: 'System',
    marginBottom: spacing.lg,
  },
  subtitle: {
    ...component.onboarding.subtitle,
    color: colors.gray800,
    textAlign: 'center',
    paddingHorizontal: spacing.xxxxl,
    fontFamily: 'System',
  },
  dot: {
    backgroundColor: colors.main,
    opacity: 0.3,
    width: spacing.sm,
    height: spacing.sm,
  },
  activeDot: {
    backgroundColor: colors.main,
    opacity: 1,
    width: spacing.sm + spacing.xxs,
    height: spacing.sm + spacing.xxs,
  },
})