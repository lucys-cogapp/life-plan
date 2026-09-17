import { useCallback, useEffect, useRef, useState } from 'react'

// Storage throws rather than returning null in Safari private mode and when a
// site is blocked from storing data, so every access is guarded and falls back
// to in-memory state for the session.
function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => read(key, initialValue))

  // Held in a ref so set/remove stay stable when a caller passes an object or
  // array literal as the initial value.
  const initialRef = useRef(initialValue)
  const keyRef = useRef(key)

  // Writes happen in the setters rather than an effect: an effect cannot tell a
  // write apart from a removal that happens to restore the initial value.
  const set = useCallback((next: T | ((current: T) => T)) => {
    setValue((current) => {
      const resolved = next instanceof Function ? next(current) : next
      try {
        localStorage.setItem(keyRef.current, JSON.stringify(resolved))
      } catch {
        // Quota exceeded or storage blocked; the in-memory value still stands.
      }
      return resolved
    })
  }, [])

  const remove = useCallback(() => {
    try {
      localStorage.removeItem(keyRef.current)
    } catch {
      // Nothing to do; the next read falls back to the initial value.
    }
    setValue(initialRef.current)
  }, [])

  // Re-read when the key changes, so a keyed hook does not carry the previous
  // key's value across and write it back under the new one.
  useEffect(() => {
    if (keyRef.current === key) return
    keyRef.current = key
    setValue(read(key, initialRef.current))
  }, [key])

  // `storage` only fires in the *other* tabs, so this syncs rather than loops.
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.storageArea !== localStorage) return
      // A null key means another tab called clear().
      if (event.key !== null && event.key !== key) return
      setValue(read(key, initialRef.current))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key])

  return [value, set, remove] as const
}
