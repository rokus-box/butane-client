// If 30 minutes have passed since the last cache update, invalidate the cache
export function cacheExpired(): boolean {
  const lastCacheTime = localStorage.getItem('lastCacheTime');
  if (null == lastCacheTime) {
    updateCacheTime();

    return true;
  }
  const lastCacheTimeMs = parseInt(lastCacheTime, 10);
  const now = new Date().getTime();
  const isExpired = now - lastCacheTimeMs > 30 * 60 * 1000;

  if (isExpired) {
    updateCacheTime();
  }

  return isExpired;
}

export function updateCacheTime() {
  localStorage.setItem('lastCacheTime', new Date().getTime().toString());
}
