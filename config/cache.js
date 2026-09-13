// Egyszerű, folyamaton belüli (in-memory) TTL cache. Nincs szüksége külön
// szolgáltatásra (pl. Redis-re) - egyetlen szerverpéldányon fut, a tárolt
// adatok a szerver újraindításakor elvesznek. Egy ilyen kis oldal olvasás-
// intenzív végpontjaihoz (ingatlanok listázása) ez bőven elegendő.

const store = new Map();

export function connectCache() {
  console.log("In-memory cache aktiv (nincs kulso Redis fuggoseg).");
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
