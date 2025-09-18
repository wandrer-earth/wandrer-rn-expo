import React, { useState } from 'react'
import {
  View,
  Keyboard,
  SafeAreaView,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { Button, Input } from 'react-native-elements'
import { useLogin } from '../../src/hooks/api/useAuth'
import { useAuthStore } from '../../src/stores/authStore'
import colors from '../../src/styles/colors'
import { fontSize } from '../../src/styles/typography'
import { spacing, padding, margin } from '../../src/styles/spacing'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  
  const loginMutation = useLogin()
  const authError = useAuthStore((state) => state.error)
  const clearError = useAuthStore((state) => state.clearError)
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const validateForm = (): boolean => {
    let isValid = true
    
    if (!email.trim()) {
      setEmailError('Email is required')
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email')
      isValid = false
    } else {
      setEmailError('')
    }
    
    if (!password.trim()) {
      setPasswordError('Password is required')
      isValid = false
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      isValid = false
    } else {
      setPasswordError('')
    }
    
    return isValid
  }

  const handleLogin = async () => {
    if (!validateForm()) {
      return
    }

    Keyboard.dismiss()
    clearError()

    try {
      await loginMutation.mutateAsync({ email: email.trim(), password })
    } catch (error: any) {
      console.error('Login error:', error)
      // Error is handled by the auth store and mutation
    }
  }

  const handleForgotPassword = () => {
    Linking.openURL('https://wandrer.earth/password/new')
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Wandrer</Text>
        
        {/* Debug Info - Show user data when authenticated */}
        {isAuthenticated && user && (
          <View style={styles.debugCard}>
            <Text style={styles.debugTitle}>✅ Login Successful!</Text>
            <Text style={styles.debugText}>User ID: {user.id}</Text>
            <Text style={styles.debugText}>Email: {user.email}</Text>
            {user.name && <Text style={styles.debugText}>Name: {user.name}</Text>}
          </View>
        )}
        
        <Input
          placeholder="Email"
          placeholderTextColor="#CCCCCC"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={(text: string) => {
            setEmail(text)
            setEmailError('')
            clearError()
          }}
          errorStyle={styles.errorStyle}
          errorMessage={emailError}
          containerStyle={styles.inputContainer}
        />
        
        <Input
          placeholder="Password"
          placeholderTextColor="#CCCCCC"
          secureTextEntry
          value={password}
          onChangeText={(text: string) => {
            setPassword(text)
            setPasswordError('')
            clearError()
          }}
          errorStyle={styles.errorStyle}
          errorMessage={passwordError}
          containerStyle={styles.inputContainer}
        />
        
        {authError && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{authError}</Text>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={[styles.errorText, styles.forgotPasswordLink]}>
                Forgot your password?
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        <Button
          title="Login"
          onPress={handleLogin}
          buttonStyle={styles.loginButton}
          titleStyle={styles.loginButtonText}
          loading={loginMutation.isPending}
          disabled={loginMutation.isPending}
        />
        
        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.forgotPassword}>Forgot your password?</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    padding: spacing.lg,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  title: {
    fontSize: fontSize.xxxxl,
    fontWeight: 'bold',
    marginTop: spacing.xxxxl,
    marginBottom: spacing.sm,
    color: colors.main,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.gray500,
    marginBottom: spacing.xxxl,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 10,
  },
  errorCard: {
    backgroundColor: colors.main,
    opacity: 0.9,
    borderColor: colors.main,
    borderWidth: 2,
    margin: spacing.xl,
    padding: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  errorText: {
    color: colors.white,
    textAlign: 'center',
    fontFamily: 'System',
  },
  forgotPasswordLink: {
    textDecorationLine: 'underline',
    marginTop: 8,
  },
  forgotPassword: {
    color: colors.main,
    marginTop: spacing.lg,
    textDecorationLine: 'underline',
    fontFamily: 'System',
  },
  errorStyle: {
    color: colors.secondary.red,
    fontFamily: 'System',
  },
  loginButton: {
    backgroundColor: colors.main,
    width: '100%',
    height: 44,
    borderRadius: 8,
    marginTop: spacing.xl,
  },
  loginButtonText: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  debugCard: {
    backgroundColor: colors.secondary.green,
    padding: spacing.lg,
    margin: spacing.xl,
    borderRadius: 8,
    alignSelf: 'stretch',
  },
  debugTitle: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  debugText: {
    color: colors.white,
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
})