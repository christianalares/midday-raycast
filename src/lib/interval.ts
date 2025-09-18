import { Cache } from '@raycast/api'

const CACHE_KEYS = {
  CURRENT_INTERVAL: 'midday-interval/1.0/current',
  LAST_CHECK_TIMESTAMP: 'midday-interval/1.0/last-check',
}

const cache = new Cache()

export const getCurrentInterval = () => {
  const currentInterval = cache.get(CACHE_KEYS.CURRENT_INTERVAL)

  if (currentInterval) {
    const timestampCache = cache.get(CACHE_KEYS.LAST_CHECK_TIMESTAMP)
    const timestamp = timestampCache ? new Date(Number.parseInt(timestampCache)) : new Date()

    const secondsSinceLastUpdate = Math.floor((Date.now() - timestamp.getTime()) / 1000)

    return {
      elapsedTime: Number.parseInt(currentInterval) + secondsSinceLastUpdate,
      lastStoredCache: timestamp,
    }
  }
}

export const setCurrentInterval = (interval: number) => {
  cache.set(CACHE_KEYS.CURRENT_INTERVAL, interval.toString())
  cache.set(CACHE_KEYS.LAST_CHECK_TIMESTAMP, Date.now().toString())
}

export const clearCurrentInterval = () => {
  cache.remove(CACHE_KEYS.CURRENT_INTERVAL)
  cache.remove(CACHE_KEYS.LAST_CHECK_TIMESTAMP)
}

export const setLastCheckTimestamp = () => {
  cache.set(CACHE_KEYS.LAST_CHECK_TIMESTAMP, Date.now().toString())
}

export const getLastCheckTimestamp = () => {
  const lastCheckTimestamp = cache.get(CACHE_KEYS.LAST_CHECK_TIMESTAMP)
  return lastCheckTimestamp ? new Date(Number.parseInt(lastCheckTimestamp)) : undefined
}
