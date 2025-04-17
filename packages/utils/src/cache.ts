export type CacheObject = Record<string, unknown>
export type CacheData = CacheObject | string | Array<unknown>

export const stringifyData = <T extends CacheData>(data: T): string => {
  try {
    return JSON.stringify(data)
  } catch (error) {
    console.error("Failed to stringify data", error)
    return JSON.stringify({}) // Return an empty object on error
  }
}

export const parseData = <R>(data: string): R | null => {
  try {
    return JSON.parse(data)
  } catch (e) {
    console.error("Failed to parse cache data", e)
    return null
  }
}

export const setCache = <T extends CacheData>(key: string, data: T, storage: Storage) => {
  const stringData = stringifyData(data)
  storage.setItem(key, stringData)
}

export const getCache = <R>(storage: Storage, key: string, def: R | null = null): R | null => {
  const data = storage.getItem(key)
  if (!data) {
    return def
  }
  return parseData<R>(data) ?? def
}

export const removeCache = (storage: Storage, key: string) => {
  storage.removeItem(key)
}

export const clearCache = (storage: Storage) => {
  storage.clear()
}

export const setSessionCache = <T extends CacheData>(key: string, data: T): void => {
  setCache(key, data, window.sessionStorage)
}

export const getSessionCache = <R>(key: string, def: R | null = null): R | null => {
  return getCache<R>(window.sessionStorage, key, def)
}

export const removeSessionCache = (key: string) => {
  removeCache(window.sessionStorage, key)
}

export const clearSessionCache = () => {
  clearCache(window.sessionStorage)
}

export const setLocalCache = <T extends CacheData>(key: string, data: T) => {
  setCache(key, data, window.localStorage)
}

export const getLocalCache = <R>(key: string, def: R | null = null): R | null =>
  getCache<R>(window.localStorage, key, def)

export const removeLocalCache = (key: string) => {
  removeCache(window.localStorage, key)
}

export const clearLocalCache = () => {
  clearCache(window.localStorage)
}

export const createCache = <T extends CacheObject | string | Array<unknown>>(storage: Storage, key: string) => {
  return {
    get: () => getCache<T>(storage, key),
    set: (data: T) => setCache(key, data, storage),
    remove: () => removeCache(storage, key)
  }
}

export const createLocalCache = <T extends CacheData>(key: string) => createCache<T>(window.localStorage, key)
export const createSessionCache = <T extends CacheData>(key: string) => createCache<T>(window.sessionStorage, key)
