import { fetcher } from "../../../utils/fetcher";
import { createDataStore } from "../createDataStore";

jest.mock("ramda/es/pathOr", () => ({
  __esModule: true,
  default: (def: any, path: string[], obj: any) =>
    path.reduce((acc: any, key) => (acc == null ? def : acc[key]), obj),
}));
jest.mock("../../../utils/fetcher", () => ({ fetcher: jest.fn() }));

let mockDB: any;
jest.mock("../../../middleware/indexedDBManager", () => ({
  indexedDBManager: {
    getConnection: async () => mockDB,
  },
}));

const mockFetcher = fetcher as jest.Mock;

/**
 * Minimal fake IDBDatabase backed by an in-memory array. Emulates the
 * transaction/request callback flow expected by createIndexedDBStorage.
 */
const createFakeDB = () => {
  let rows: any[] = [];
  return {
    transaction: () => {
      const tx: any = {
        objectStore: () => ({
          getAll: () => {
            const req: any = {};
            Promise.resolve().then(() => {
              req.result = [...rows];
              req.onsuccess?.();
            });
            return req;
          },
          clear: () => {
            rows = [];
          },
          put: (item: any) => {
            rows.push(item);
          },
        }),
      };
      Promise.resolve().then(() => tx.oncomplete?.());
      return tx;
    },
    getRows: () => rows,
  };
};

const createStore = (initData?: any[] | null, fallbackData?: any[] | null) =>
  createDataStore<any>({
    name: "test-store",
    dbName: "ORDERLY_TEST_STORE",
    storeName: "TEST_STORE",
    keyPath: "id",
    endpoint: "/v1/public/test",
    initData,
    fallbackData,
  });

const awaitHydration = async (store: any) => {
  for (let i = 0; i < 100 && !store.getState().hydrated; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  expect(store.getState().hydrated).toBe(true);
};

/** Lets the async IndexedDB write chain flushed by persist middleware settle */
const flushWrites = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
};

describe("createDataStore persistence", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDB = createFakeDB();
  });

  it("does not persist initData to IndexedDB when the first fetch fails", async () => {
    mockFetcher.mockRejectedValue(new Error("network down"));
    const initData = [{ id: "init" }];
    const store = createStore(initData);

    await awaitHydration(store);
    await store.getState().fetchData();
    await flushWrites();

    expect(store.getState().error).toBeInstanceOf(Error);
    expect(store.getState().data).toEqual(initData);
    expect(mockDB.getRows()).toEqual([]);
  });

  it("does not expose fallbackData before a fetch fails", async () => {
    const fallbackData = [{ id: "fallback" }];
    const store = createStore(null, fallbackData);

    await awaitHydration(store);

    expect(store.getState().data).toBeNull();
    expect(mockDB.getRows()).toEqual([]);
  });

  it("uses fallbackData after a failed fetch without persisting it", async () => {
    mockFetcher.mockRejectedValue(new Error("network down"));
    const fallbackData = [{ id: "fallback" }];
    const store = createStore(null, fallbackData);

    await awaitHydration(store);
    const result = await store.getState().fetchData();
    await flushWrites();

    expect(result).toBe(fallbackData);
    expect(store.getState().data).toBe(fallbackData);
    expect(store.getState().error).toBeInstanceOf(Error);
    expect(mockDB.getRows()).toEqual([]);
  });

  it("does not persist initData when fetch starts before hydration completes", async () => {
    mockFetcher.mockRejectedValue(new Error("network down"));
    const initData = [{ id: "init" }];
    const store = createStore(initData);

    // no awaitHydration: fetch races ahead of the async IndexedDB
    // rehydration, so state.data is still the static initData
    await Promise.all([awaitHydration(store), store.getState().fetchData()]);
    await flushWrites();

    expect(store.getState().data).toEqual(initData);
    expect(mockDB.getRows()).toEqual([]);
  });

  it("persists data to IndexedDB after a successful fetch", async () => {
    mockFetcher.mockResolvedValue([{ id: "api" }]);
    const store = createStore([{ id: "init" }]);

    await awaitHydration(store);
    await store.getState().fetchData();
    await flushWrites();

    expect(store.getState().error).toBeNull();
    expect(mockDB.getRows()).toEqual([{ id: "api" }]);
  });

  it("keeps previous cache in IndexedDB when a later fetch fails", async () => {
    mockFetcher.mockResolvedValueOnce([{ id: "api" }]);
    const store = createStore();

    await awaitHydration(store);
    await store.getState().fetchData();

    mockFetcher.mockRejectedValue(new Error("network down"));
    await store.getState().fetchData();
    await flushWrites();

    expect(store.getState().error).toBeInstanceOf(Error);
    expect(mockDB.getRows()).toEqual([{ id: "api" }]);
  });

  it("keeps initial data when IndexedDB is empty (hydration must not wipe it)", async () => {
    const initData = [{ id: "init" }];
    const store = createStore(initData);

    await awaitHydration(store);

    expect(store.getState().data).toEqual(initData);
  });

  it("hydrates persisted data over initial data when IndexedDB has a cache", async () => {
    mockDB = createFakeDB();
    mockDB.transaction = () => {
      const tx: any = {
        objectStore: () => ({
          getAll: () => {
            const req: any = {};
            Promise.resolve().then(() => {
              req.result = [{ id: "cached" }];
              req.onsuccess?.();
            });
            return req;
          },
          clear: () => {},
          put: () => {},
        }),
      };
      Promise.resolve().then(() => tx.oncomplete?.());
      return tx;
    };
    const store = createStore([{ id: "init" }]);

    await awaitHydration(store);

    expect(store.getState().data).toEqual([{ id: "cached" }]);
  });
});
