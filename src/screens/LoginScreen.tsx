import React, { useState } from 'react'
import {
  View,
  Keyboard,
  SafeAreaView,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native'
import { Button, Input } from 'react-native-elements'
import { useLogin } from '../hooks/api/useAuth'
import { useAuthStore } from '../stores/authStore'

interface LoginScreenProps {
  navigation: any
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  
  const loginMutation = useLogin()
  const authError = useAuthStore((state) => state.error)
  const clearError = useAuthStore((state) => state.clearError)

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
      <View style={styles.content}>
        <Text style={styles.title}>Wandrer Login</Text>
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
    justifyContent: 'center',
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 40,
    color: '#FF6B6B',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 10,
  },
  errorCard: {
    backgroundColor: '#FF6B6B',
    opacity: 0.9,
    borderColor: '#FF6B6B',
    borderWidth: 2,
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
    fontFamily: 'System',
  },
  forgotPasswordLink: {
    textDecorationLine: 'underline',
    marginTop: 8,
  },
  forgotPassword: {
    color: '#FF6B6B',
    marginTop: 16,
    textDecorationLine: 'underline',
    fontFamily: 'System',
  },
  errorStyle: {
    color: 'red',
    fontFamily: 'System',
  },
  loginButton: {
    backgroundColor: '#FF6B6B',
    width: '100%',
    height: 44,
    borderRadius: 8,
    marginTop: 20,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
})

export default LoginScreen