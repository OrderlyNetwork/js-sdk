import pathOr from "ramda/es/pathOr";
import { create } from "zustand";
import {
  createIndexedDBStorage,
  persistIndexedDB,
} from "../../middleware/persistIndexedDB";
import { fetcher } from "../../utils/fetcher";
import { resolveFallbackData } from "./createDataStore.fallback";

/**
 * Generic store state for data fetching
 */
export interface DataStoreState<T> {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
  name: string;
  /** Whether the store has been hydrated from IndexedDB */
  hydrated: boolean;
}

/**
 * Generic store actions for data fetching
 */
export interface DataStoreActions<T> {
  fetchData: (
    baseUrl?: string,
    options?: { brokerId?: string },
  ) => Promise<T[] | null>;
  setHydrated: (hydrated: boolean) => void;
}

/**
 * Configuration for creating a data store
 */
export interface DataStoreConfig<T> {
  /** Store name for persistence */
  name: string;
  /** Database name */
  dbName: string;
  /** Store name in IndexedDB */
  storeName: string;
  /** Key path for IndexedDB */
  keyPath: string;
  /** API endpoint path */
  endpoint: string;
  /** Optional base URL */
  baseUrl?: string;
  /** Optional data transformer */
  formatter?: (data: any) => T[];
  /** Initial data used when the store is created. */
  initData?: T[] | null;
  /**
   * Fetch-failure fallback when neither memory nor IndexedDB has usable data.
   * Defaults to `initData` for backward compatibility. Fallback data is never
   * persisted to IndexedDB; only successful responses are written to cache.
   */
  fallbackData?: T[] | null;

  // brokerId: string;
}

/**
 * Creates a Zustand store with IndexedDB persistence for data fetching
 *
 * @param config Store configuration
 * @returns A Zustand store hook
 *
 * @example
 * ```typescript
 * const useChainInfoStore = createDataStore<API.Chain>({
 *   name: "orderly-chain-info",
 *   dbName: "ORDERLY_STORE",
 *   storeName: "ORDERLY_CHAIN_INFO",
 *   keyPath: "chain_id",
 *   endpoint: "/v1/public/chain_info",
 *   baseUrl: "https://api.orderly.org"
 * });
 * ```
 */
export const createDataStore = <T>(config: DataStoreConfig<T>) => {
  const {
    name,
    dbName,
    storeName,
    keyPath,
    endpoint,
    baseUrl,
    formatter = (data: any) => pathOr([], ["rows"], data),
    initData,
    fallbackData,
    // brokerId,
  } = config;

  const indexedDBStorage = createIndexedDBStorage<T>({
    dbName,
    storeName,
  });

  // Captured by reference so `partialize` can recognize data that was never
  // fetched (initial state) and skip persisting it
  const initialData = typeof initData === "undefined" ? [] : initData;
  const fetchFailureFallback =
    typeof fallbackData === "undefined" ? initData : fallbackData;

  return create(
    persistIndexedDB<DataStoreState<T> & DataStoreActions<T>>(
      (set, get) => {
        const store = {
          name: storeName,
          data: initialData,
          loading: false,
          error: null,
          hydrated: false,
          setHydrated: (hydrated: boolean) => set({ hydrated }),
          fetchData: async (
            dynamicBaseUrl?: string,
            options?: { brokerId?: string },
          ) => {
            try {
              set({ loading: true });
              const brokerIdQuery =
                typeof options?.brokerId === "string" &&
                options?.brokerId !== "orderly"
                  ? `?broker_id=${options?.brokerId}`
                  : "";
              const url = `${dynamicBaseUrl || baseUrl || ""}${endpoint}${brokerIdQuery}`;

              const data = await fetcher(url, {}, { formatter });
              set({
                data: data,
                loading: false,
                error: null,
              });
              return data;
            } catch (error) {
              const currentData = get().data;
              const data = await resolveFallbackData(
                currentData,
                fetchFailureFallback,
                indexedDBStorage,
              );
              const fallbackUpdate = { error: error as Error, loading: false };
              if (data !== currentData) {
                set({ ...fallbackUpdate, data });
              } else {
                set(fallbackUpdate);
              }
              return data;
            }
          },
        };
        return store;
      },
      {
        name,
        indexedDBConfig: {
          dbName,
          storeName,
        },
        //@ts-ignore
        // Only persist data obtained from a successful fetch. zustand's
        // persist middleware writes on every set(), so both guards are
        // needed: `error` skips error-path writes, and the `initialData`
        // reference check skips the pristine state (e.g. the initial
        // `loading: true` set) whose data is still the static initData —
        // a persisted copy would shadow newer initData in future releases.
        partialize: (state) =>
          state.error || state.data === initialData
            ? undefined
            : (state.data as T[]),
        merge: (persisted, current) => {
          return {
            ...current,
            // When nothing was stored, zustand calls merge with
            // `undefined` — keep the initial data instead of wiping it
            data: (persisted === undefined ? current.data : persisted) as
              | T[]
              | null,
          };
        },
        /**
         * Callback executed after rehydration from IndexedDB completes
         * Sets hydrated flag to true to indicate store is ready
         */
        onRehydrateStorage: () => (state, error) => {
          if (state && !error) {
            // state.hydrated = true;
            state.setHydrated(true);
          }
        },
      },
    ),
  );
};
