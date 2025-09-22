interface Environment {
  API_BASE_URL: string
  TILE_BASE_URL: string
  isDevelopment: boolean
}

const createEnvironment = (): Environment => {
  const isDevelopment = __DEV__
  
  return {
    API_BASE_URL: 'https://wandrer.earth',
    TILE_BASE_URL: 'https://tiles2.wandrer.earth',
    isDevelopment,
  }
}

export const environment = createEnvironment()