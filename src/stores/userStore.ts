import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface TileData {
  url: string
}

export interface UserProperties {
  id: number | string
  token?: string
  bike_tiles?: TileData
  foot_tiles?: TileData
  combined_bike_tiles?: TileData
  combined_foot_tiles?: TileData
}

interface UserStore {
  user: UserProperties | null
  setUser: (user: UserProperties | null) => void
  updateUserProperties: (properties: Partial<UserProperties>) => void
}

export const useUserStore = create<UserStore>()(
  devtools(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      updateUserProperties: (properties) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...properties } : null,
        })),
    }),
    {
      name: 'user-storage',
    }
  )
)