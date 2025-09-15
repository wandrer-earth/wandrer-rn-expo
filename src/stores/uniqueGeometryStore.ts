import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface UniqueGeometryStore {
  uniqueGeometry: string | null
  setUniqueGeometry: (geometry: string | null) => void
  clearUniqueGeometry: () => void
}

export const useUniqueGeometryStore = create<UniqueGeometryStore>()(
  devtools(
    (set) => ({
      uniqueGeometry: null,
      
      setUniqueGeometry: (geometry) => set({ uniqueGeometry: geometry }),
      
      clearUniqueGeometry: () => set({ uniqueGeometry: null }),
    }),
    {
      name: 'unique-geometry-storage',
    }
  )
)