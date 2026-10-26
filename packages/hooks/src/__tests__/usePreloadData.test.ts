import { renderHook } from "@testing-library/react-hooks";
import useSWR from "swr";
import { usePreLoadData } from "../usePreloadData";

// Exercise the shared net implementation without requiring rebuilt packages.
jest.mock("@orderly.network/net", () =>
  jest.requireActual("@orderly.network/net/src/fetch"),
);
jest.mock("@orderly.network/utils", () =>
  jest.requireActual("@orderly.network/utils/src/window"),
);
jest.mock("swr", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("../orderlyContext", () => ({
  OrderlyContext: jest.requireActual("react").createContext({
    configStore: {
      get: (key: string) =>
        key === "env" ? "prod" : "https://api.example.com",
    },
    enableSwapDeposit: false,
  }),
}));

const mockFetchData = jest.fn(async () => undefined);
jest.mock("../orderly/appStore", () => ({
  useAppStore: (selector: any) =>
    selector({ actions: { setTokensInfo: jest.fn() } }),
}));
jest.mock("../provider/store/mainTokenStore", () => ({
  useMainTokenStore: (selector: any) => selector({ fetchData: mockFetchData }),
}));
jest.mock("../provider/store/testTokenStore", () => ({
  useTestTokenStore: (selector: any) => selector({ fetchData: mockFetchData }),
}));
jest.mock("../provider/store/chainInfoMainStore", () => ({
  useMainnetChainsStore: (selector: any) =>
    selector({ fetchData: mockFetchData }),
}));
jest.mock("../provider/store/chainInfoTestStore", () => ({
  useTestnetChainsStore: (selector: any) =>
    selector({ fetchData: mockFetchData }),
}));
jest.mock("../provider/store/symbolStore", () => ({
  useSymbolStore: (selector: any) => selector({ fetchData: mockFetchData }),
}));
jest.mock("../provider/store/swapSupportStore", () => ({
  useSwapSupportStore: (selector: any) =>
    selector({ fetchData: mockFetchData }),
}));

const useSWRMock = useSWR as jest.Mock;
const OFFSET_KEY = "__ORDERLY_timestamp_offset";
const LISTENERS_KEY = "__ORDERLY_timestamp_offset_listeners";
const globalObj = globalThis as unknown as Record<string, unknown>;
const originalFetch = globalThis.fetch;
const systemInfo = { status: 0 };
let wallNow: number;
let elapsed: number;

function mockResponse(timestamp: unknown, transitMs: number) {
  globalThis.fetch = jest.fn(async () => {
    wallNow += transitMs;
    elapsed += transitMs;
    return {
      ok: true,
      json: async () => ({ success: true, timestamp, data: systemInfo }),
    } as Response;
  });
}

function fetchSystemInfo() {
  const [key, fetcher] = useSWRMock.mock.calls.at(-1)!;
  return fetcher(key) as Promise<unknown>;
}

beforeEach(() => {
  delete globalObj[OFFSET_KEY];
  delete globalObj[LISTENERS_KEY];
  jest.clearAllMocks();
  useSWRMock.mockReturnValue({
    data: undefined,
    mutate: jest.fn(async () => undefined),
  });
  wallNow = 500_000;
  elapsed = 0;
  jest.spyOn(Date, "now").mockImplementation(() => wallNow);
  jest.spyOn(performance, "now").mockImplementation(() => elapsed);
});

afterEach(() => {
  delete globalObj[OFFSET_KEY];
  delete globalObj[LISTENERS_KEY];
  globalThis.fetch = originalFetch;
  jest.restoreAllMocks();
});

test("initializes at response arrival without re-calibrating during a later render", async () => {
  mockResponse(500_100, 200);
  const { result, rerender } = renderHook(() => usePreLoadData());
  expect(result.current.done).toBe(false);

  const data = await fetchSystemInfo();
  expect(globalObj[OFFSET_KEY]).toBe(-100);
  expect(globalThis.fetch).toHaveBeenCalledWith(
    "https://api.example.com/v1/public/system_info",
    expect.objectContaining({ method: "GET" }),
  );

  wallNow += 2_000;
  useSWRMock.mockReturnValue({ data });
  rerender();
  expect(result.current.done).toBe(true);
  expect(globalObj[OFFSET_KEY]).toBe(-100);
});

test("a delayed bootstrap response preserves an offset set by another request", async () => {
  globalObj[OFFSET_KEY] = 0;
  mockResponse(500_100, 4_000);
  const { result, rerender } = renderHook(() => usePreLoadData());

  const data = await fetchSystemInfo();
  useSWRMock.mockReturnValue({ data });
  rerender();
  expect(result.current.done).toBe(true);
  expect(globalObj[OFFSET_KEY]).toBe(0);
});

test("a rejected slow sample can use an already initialized offset", async () => {
  globalObj[OFFSET_KEY] = 0;
  mockResponse(500_100, 30_000);
  const { result, rerender } = renderHook(() => usePreLoadData());

  const data = await fetchSystemInfo();
  useSWRMock.mockReturnValue({ data });
  rerender();
  expect(result.current.done).toBe(true);
  expect(globalObj[OFFSET_KEY]).toBe(0);
});

test("a slow first response rejects for SWR retry and a later fast response initializes", async () => {
  mockResponse(500_100, 30_000);
  const { result, rerender } = renderHook(() => usePreLoadData());

  await expect(fetchSystemInfo()).rejects.toThrow(
    "Failed to initialize server timestamp offset",
  );
  expect(result.current.done).toBe(false);
  expect(globalObj[OFFSET_KEY]).toBeUndefined();

  mockResponse(wallNow + 100, 200);
  const data = await fetchSystemInfo();
  useSWRMock.mockReturnValue({ data });
  rerender();
  expect(result.current.done).toBe(true);
  expect(globalObj[OFFSET_KEY]).toBe(-100);
});

test.each([undefined, "500100", NaN, Infinity])(
  "does not finish initialization from an invalid timestamp %s",
  async (timestamp) => {
    mockResponse(timestamp, 200);
    const { result } = renderHook(() => usePreLoadData());

    await expect(fetchSystemInfo()).rejects.toThrow(
      "Failed to initialize server timestamp offset",
    );
    expect(result.current.done).toBe(false);
    expect(globalObj[OFFSET_KEY]).toBeUndefined();
  },
);

test("cached system info cannot initialize the clock without a new calibration", () => {
  useSWRMock.mockReturnValue({
    data: { success: true, timestamp: 400_000, data: systemInfo },
  });
  const { result } = renderHook(() => usePreLoadData());
  expect(result.current.done).toBe(false);
  expect(globalObj[OFFSET_KEY]).toBeUndefined();
});
