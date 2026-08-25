type IndexedDBStorageLike<T> = {
  getItem: () => Promise<Array<T> | null>;
};

export const hasUsableData = <T>(data: T[] | null | undefined): boolean =>
  Array.isArray(data) && data.length > 0;

/**
 * Resolves data on fetch failure: in-memory cache → IndexedDB → fallback.
 */
export const resolveFallbackData = async <T>(
  currentData: T[] | null,
  fallbackData: T[] | null | undefined,
  indexedDBStorage: IndexedDBStorageLike<T>,
): Promise<T[] | null> => {
  if (hasUsableData(currentData)) {
    return currentData;
  }

  try {
    const cached = await indexedDBStorage.getItem();
    if (hasUsableData(cached)) {
      return cached!;
    }
  } catch {
    // IndexedDB read failed; fall through to fallback data
  }

  if (typeof fallbackData !== "undefined") {
    return fallbackData;
  }

  return currentData;
};
