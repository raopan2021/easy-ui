/**
 * 清除 sessionStorage 中以 CACHE_ 开头的业务缓存
 * @param prefix 自定义前缀，默认 "CACHE_"
 * @example
 * clearSessionCache()       // 清除所有 CACHE_ 开头的缓存
 * clearSessionCache("TEMP_")    // 清除所有 TEMP_ 开头的缓存
 */
export function clearSessionCache(prefix = 'CACHE_') {
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const key = sessionStorage.key(i)
    if (key?.startsWith(prefix)) {
      sessionStorage.removeItem(key)
    }
  }
}
