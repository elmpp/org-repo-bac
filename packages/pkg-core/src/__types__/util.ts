export type CacheKey = {
  /** the global cache buster. Should be supplied from constants.GLOBAL_CACHE_KEY */
  globalVersion: number
  key: string
}
