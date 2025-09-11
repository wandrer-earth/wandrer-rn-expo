import { useEffect } from 'react'
import { useAuthStore, createUserProperties } from '../stores/authStore'
import { useUserStore } from '../stores/userStore'

export const useAuthSync = () => {
  const { user, isAuthenticated } = useAuthStore()
  const { setUser } = useUserStore()

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const userProperties = createUserProperties(user.id)
      setUser(userProperties)
    } else {
      setUser(null)
    }
  }, [isAuthenticated, user?.id, setUser])
}