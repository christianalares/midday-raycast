import { Cache } from '@raycast/api'

const CACHE_KEYS = {
  CURRENT_INTERVAL_KEY: 'midday-interval/1.0',
}

const cache = new Cache()

export const getCurrentInterval = () => {
  const currentInterval = cache.get(CACHE_KEYS.CURRENT_INTERVAL_KEY)

  if (currentInterval) {
    return Number.parseInt(currentInterval)
  }
}

export const setCurrentInterval = (interval: number) => {
  cache.set(CACHE_KEYS.CURRENT_INTERVAL_KEY, interval.toString())
}

export const clearCurrentInterval = () => {
  cache.remove(CACHE_KEYS.CURRENT_INTERVAL_KEY)
}
