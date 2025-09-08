import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useLogout } from '../../src/hooks/api/useAuth'
import { useAuthStore } from '../../src/stores/authStore'

export default function SettingsScreen() {
  const logoutMutation = useLogout()
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <View style={styles.userInfo}>
        <Text style={styles.sectionTitle}>User Information</Text>
        {isLoading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : user ? (
          <View style={styles.userDetails}>
            <Text style={styles.userDetail}>User ID: {user.id}</Text>
            {user.email && <Text style={styles.userDetail}>Email: {user.email}</Text>}
            {user.name && <Text style={styles.userDetail}>Name: {user.name}</Text>}
          </View>
        ) : (
          <Text style={styles.errorText}>Unable to load user information</Text>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
        disabled={logoutMutation.isPending}
      >
        <Text style={styles.logoutButtonText}>
          {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  userDetails: {
    gap: 8,
  },
  userDetail: {
    fontSize: 14,
    color: '#666',
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontStyle: 'italic',
  },
})