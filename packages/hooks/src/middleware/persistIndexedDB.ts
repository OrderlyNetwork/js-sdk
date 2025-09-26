import pathOr from "ramda/es/pathOr";
import { StateCreator, StoreMutatorIdentifier } from "zustand";
import {
  PersistOptions,
  StateStorage,
  persist,
  createJSONStorage,
} from "zustand/middleware";
import { indexedDBManager } from "./indexedDBManager";

/**
 * Configuration for IndexedDB storage
 */
interface IndexedDBStorageConfig {
  /** Database name */
  dbName: string;
  /** Object store name */
  storeName: string;
}

/**
 * IndexedDB storage interface for array-based data operations
 */
interface IndexedDBStorage<T = unknown> {
  /** Get all stored data */
  getItem: () => Promise<Array<T> | null>;
  /** Replace all data (clear and insert) */
  setItem: (value: Array<T>) => Promise<void>;
  /** Clear all data */
  removeItem: () => Promise<void>;
}

/**
 * Creates an IndexedDB storage instance using simple connection manager
 */
const createIndexedDBStorage = <T = unknown>(
  config: IndexedDBStorageConfig,
): IndexedDBStorage<T> => {
  const { dbName, storeName } = config;

  /**
   * Gets database connection from manager with automatic initialization
   * Uses Promise-based initialization to prevent race conditions
   */
  const getDB = async (): Promise<IDBDatabase> => {
    // The manager now handles initialization automatically with Promise caching
    return indexedDBManager.getConnection(dbName, storeName);
  };

  /**
   * Executes a transaction with proper error handling
   */
  const executeTransaction = async <R>(
    operation: (store: IDBObjectStore) => R,
    mode: IDBTransactionMode = "readwrite",
  ): Promise<R> => {
    const dbInstance = await getDB();
    const transaction = dbInstance.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const result = operation(store);

      transaction.oncomplete = () => resolve(result);
      transaction.onerror = () => {
        console.error(
          `Transaction failed for ${storeName}:`,
          transaction.error,
        );
        reject(transaction.error);
      };
      transaction.onabort = () => {
        console.error(`Transaction aborted for ${storeName}`);
        reject(new Error("Transaction was aborted"));
      };
    });
  };

  /**
   * Retrieves all data from the store
   */
  const getItem = async (): Promise<Array<T> | null> => {
    try {
      const allValues = await executeTransaction((store) => {
        return new Promise<Array<T>>((resolve, reject) => {
          const request = store.getAll();
          request.onsuccess = () => {
            const result = request.result as Array<T>;
            resolve(result.length > 0 ? result : []);
          };
          request.onerror = () => reject(request.error);
        });
      }, "readonly");

      return allValues.length > 0 ? allValues : null;
    } catch (error) {
      console.error(`Failed to get items from ${storeName}:`, error);
      return null;
    }
  };

  /**
   * Replaces all data in the store (clear + insert)
   */
  const setItem = async (value: Array<T>): Promise<void> => {
    try {
      await executeTransaction((store) => {
        store.clear();
        value.forEach((item) => store.put(item));
        return undefined;
      }, "readwrite");
    } catch (error) {
      console.error(`Failed to set items in ${storeName}:`, error);
      throw error;
    }
  };

  /**
   * Clears all data from the store
   */
  const removeItem = async (): Promise<void> => {
    try {
      await executeTransaction((store) => {
        store.clear();
        return undefined;
      }, "readwrite");
    } catch (error) {
      console.error(`Failed to remove items from ${storeName}:`, error);
      throw error;
    }
  };

  return {
    getItem,
    setItem,
    removeItem,
  };
};

/**
 * Configuration options for IndexedDB persistence middleware
 */
type IndexedDBPersistOptions<T, U = T> = Omit<
  PersistOptions<T, U>,
  "storage"
> & {
  /** IndexedDB configuration */
  indexedDBConfig: IndexedDBStorageConfig;
};

/**
 * Adapts IndexedDBStorage to Zustand's StateStorage interface
 */
const adaptToStateStorage = <T>(
  indexedDBStorage: IndexedDBStorage<T>,
): StateStorage => ({
  getItem: async (): Promise<string | null> => {
    try {
      const result = await indexedDBStorage.getItem();

      return result
        ? JSON.stringify({
            state: result,
            version: 0,
          })
        : null;
    } catch (error) {
      console.error("Failed to get item from IndexedDB storage:", error);
      return null;
    }
  },

  setItem: async (_name: string, value: string): Promise<void> => {
    try {
      const parsed = JSON.parse(value);
      const stateData = pathOr([], ["state"], parsed) as Array<T>;
      await indexedDBStorage.setItem(stateData);
    } catch (error) {
      console.error("Failed to set item in IndexedDB storage:", error);
      console.warn("Raw value that failed to parse:", _name, value);
    }
  },

  removeItem: async (): Promise<void> => {
    try {
      await indexedDBStorage.removeItem();
    } catch (error) {
      console.error("Failed to remove item from IndexedDB storage:", error);
    }
  },
});

/**
 * Creates a Zustand store with IndexedDB persistence
 *
 * @param initializer - The state creator function
 * @param options - Persistence options including IndexedDB configuration
 * @returns A state creator with IndexedDB persistence middleware applied
 *
 * @example
 * ```typescript
 * const useStore = create(
 *   persistIndexedDB(
 *     (set) => ({
 *       items: [],
 *       addItem: (item) => set((state) => ({ items: [...state.items, item] })),
 *     }),
 *     {
 *       name: 'my-store',
 *       indexedDBConfig: {
 *         dbName: 'ORDERLY_STORE',
 *         storeName: 'ITEMS_STORE',
 *       },
 *     }
 *   )
 * );
 * ```
 */
export const persistIndexedDB = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
  U = T,
>(
  initializer: StateCreator<T, [...Mps, ["zustand/persist", unknown]], Mcs>,
  options: IndexedDBPersistOptions<T, U>,
): StateCreator<T, Mps, [["zustand/persist", U], ...Mcs]> => {
  const { indexedDBConfig, ...rest } = options;
  // Create IndexedDB storage instance
  const indexedDBStorage = createIndexedDBStorage<U>(indexedDBConfig);

  // Create JSON storage wrapper for IndexedDB
  const jsonStorage = createJSONStorage(() =>
    adaptToStateStorage(indexedDBStorage),
  );

  // Apply persist middleware with IndexedDB storage
  return persist(initializer, {
    ...rest,
    storage: jsonStorage,
  }) as StateCreator<T, Mps, [["zustand/persist", U], ...Mcs]>;
};
