import pathOr from "ramda/es/pathOr";
import { create } from "zustand";
import { persistIndexedDB } from "../../middleware/persistIndexedDB";
import { fetcher } from "../../utils/fetcher";

/**
 * Generic store state for data fetching
 */
export interface DataStoreState<T> {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Generic store actions for data fetching
 */
export interface DataStoreActions<T> {
  fetchData: (
    baseUrl?: string,
    options?: { brokerId?: string },
  ) => Promise<T[]>;
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

  initData?: T[] | null;

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
    // brokerId,
  } = config;

  return create(
    persistIndexedDB<DataStoreState<T> & DataStoreActions<T>>(
      (set) => ({
        data: typeof initData === "undefined" ? [] : initData,
        loading: false,
        error: null,
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
            const dataWithBrokerId = data.map((item: T) => ({
              ...item,
              broker_id: options?.brokerId,
            }));
            set({
              data: dataWithBrokerId,
              loading: false,
              error: null,
            });
            return dataWithBrokerId;
          } catch (error) {
            set({ error: error as Error, loading: false });
            return null;
          }
        },
      }),
      {
        name,
        indexedDBConfig: {
          dbName,
          storeName,
        },
        //@ts-ignore
        partialize: (state) => state.data as T[],
        merge: (persisted, current) => {
          return {
            ...current,
            data: persisted as T[] | null,
          };
        },
      },
    ),
  );
};
