// Simple in-process (in-memory) TTL cache. Needs no separate service (such
// as Redis) - it runs inside a single server instance, and the cached data is
// lost when the server restarts. For the read-heavy endpoints of a small site
// like this one (listing properties) that is more than enough.

const store = new Map();

export function connectCache() {
  console.log("In-memory cache active (no external Redis dependency).");
}

export function cacheGet(key) {
  const entry = store.get(key);
  if (!entry) return null;

  if (entry.expiresAt <= Date.now()) {
    store.delete(key);
    return null;
  }

  return entry.value;
}

export function cacheSet(key, value, ttlSeconds = 60) {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export function cacheDel(...keys) {
  for (const key of keys) {
    store.delete(key);
  }
}
