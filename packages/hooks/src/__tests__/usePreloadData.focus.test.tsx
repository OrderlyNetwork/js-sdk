import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import { usePreLoadData } from "../usePreloadData";

// Use real SWR and the actual net fetcher: focus must bypass both its wall-clock
// throttle and its 2s deduplication window, not merely call a mocked mutate.
jest.mock("@orderly.network/net", () =>
  jest.requireActual("@orderly.network/net/src/fetch"),
);
jest.mock("@orderly.network/utils", () =>
  jest.requireActual("@orderly.network/utils/src/window"),
);
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

const globalObj = globalThis as unknown as Record<string, unknown>;
const originalFetch = globalThis.fetch;
const serverNow = 500_000;
let jump: number;
let fetchMock: jest.Mock;
let visibility: DocumentVisibilityState;

const response = (timestamp: unknown = serverNow) =>
  ({
    ok: true,
    json: async () => ({ success: true, timestamp, data: { status: 0 } }),
  }) as Response;

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        provider: () => new Map(),
        focusThrottleInterval: 5_000,
        dedupingInterval: 2_000,
      }}
    >
      {children}
    </SWRConfig>
  );
}

function focus() {
  act(() => {
    window.dispatchEvent(new Event("focus"));
  });
}

beforeEach(() => {
  delete globalObj.__ORDERLY_timestamp_offset;
  delete globalObj.__ORDERLY_timestamp_offset_listeners;
  jump = 0;
  visibility = "visible";
  jest.spyOn(Date, "now").mockImplementation(() => serverNow + jump);
  jest.spyOn(performance, "now").mockReturnValue(0);
  jest
    .spyOn(document, "visibilityState", "get")
    .mockImplementation(() => visibility);
  fetchMock = jest.fn(async () => response());
  globalThis.fetch = fetchMock;
});
afterEach(() => {
  delete globalObj.__ORDERLY_timestamp_offset;
  delete globalObj.__ORDERLY_timestamp_offset_listeners;
  globalThis.fetch = originalFetch;
  jest.restoreAllMocks();
});

test.each([-300_000, 300_000])(
  "focus requests a fresh sample and corrects a %sms jump inside SWR's dedupe window",
  async (clockJump) => {
    const { result } = renderHook(() => usePreLoadData(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.done).toBe(true));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(globalObj.__ORDERLY_timestamp_offset).toBe(0);

    jump = clockJump;
    focus();
    await waitFor(() =>
      expect(globalObj.__ORDERLY_timestamp_offset).toBe(-clockJump),
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // An immediate opposite adjustment and then restoration must each fetch;
    // no five-second wait is permitted, even when the wall clock moves back.
    jump = -clockJump;
    focus();
    await waitFor(() =>
      expect(globalObj.__ORDERLY_timestamp_offset).toBe(clockJump),
    );
    expect(fetchMock).toHaveBeenCalledTimes(3);
    jump = 0;
    focus();
    await waitFor(() => expect(globalObj.__ORDERLY_timestamp_offset).toBe(0));
    expect(fetchMock).toHaveBeenCalledTimes(4);
  },
);

test("coalesces focus and visibility events while a sample is pending and cleans up on unmount", async () => {
  const { result, unmount } = renderHook(() => usePreLoadData(), {
    wrapper: Wrapper,
  });
  await waitFor(() => expect(result.current.done).toBe(true));
  let resolve!: (value: Response) => void;
  fetchMock.mockImplementationOnce(
    () =>
      new Promise<Response>((done) => {
        resolve = done;
      }),
  );
  jump = 300_000;
  focus();
  act(() => {
    document.dispatchEvent(new Event("visibilitychange"));
  });
  expect(fetchMock).toHaveBeenCalledTimes(2);
  await act(async () => {
    resolve(response());
  });
  expect(globalObj.__ORDERLY_timestamp_offset).toBe(-jump);

  jump = 0;
  visibility = "hidden";
  focus();
  expect(fetchMock).toHaveBeenCalledTimes(2);
  visibility = "visible";
  act(() => {
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await waitFor(() => expect(globalObj.__ORDERLY_timestamp_offset).toBe(0));
  expect(fetchMock).toHaveBeenCalledTimes(3);
  unmount();
  focus();
  act(() => {
    document.dispatchEvent(new Event("visibilitychange"));
  });
  expect(fetchMock).toHaveBeenCalledTimes(3);
});

test("a failed focus request preserves the offset and releases the next focus request", async () => {
  const { result } = renderHook(() => usePreLoadData(), { wrapper: Wrapper });
  await waitFor(() => expect(result.current.done).toBe(true));
  fetchMock.mockRejectedValueOnce(new Error("offline"));
  jump = 300_000;
  await act(async () => {
    window.dispatchEvent(new Event("focus"));
  });
  expect(globalObj.__ORDERLY_timestamp_offset).toBe(0);
  expect(result.current.done).toBe(true);
  focus();
  await waitFor(() => expect(globalObj.__ORDERLY_timestamp_offset).toBe(-jump));
});

test("a focus response without a usable timestamp does not overwrite the last offset", async () => {
  const { result } = renderHook(() => usePreLoadData(), { wrapper: Wrapper });
  await waitFor(() => expect(result.current.done).toBe(true));
  fetchMock.mockResolvedValueOnce(response("invalid"));
  jump = -300_000;
  await act(async () => {
    window.dispatchEvent(new Event("focus"));
  });
  expect(globalObj.__ORDERLY_timestamp_offset).toBe(0);
  focus();
  await waitFor(() => expect(globalObj.__ORDERLY_timestamp_offset).toBe(-jump));
});
