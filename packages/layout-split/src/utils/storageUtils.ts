/**
 * Shared localStorage utilities for SSR safety and consistent read/write patterns.
 * Guards against undefined window and localStorage.
 */

/** Returns true when localStorage is available (browser env). */
export function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

/**
 * Reads raw string from localStorage; returns null when unavailable or key missing.
 *
 * @param key - Storage key
 * @returns Stored value or null
 */
export function getStorageItem(key: string): string | null {
  if (!hasStorage()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Writes value to localStorage; no-op when unavailable (SSR).
 *
 * @param key - Storage key
 * @param value - Value to store
 */
export function writeStorage(key: string, value: string): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}
