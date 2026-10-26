import React, { PropsWithChildren } from "react";
import { act, renderHook } from "@testing-library/react";
import { SWRConfig, unstable_serialize, useSWRConfig } from "swr";
import { AccountStatusEnum, type API } from "@orderly.network/types";
import { CalculatorScope } from "../types";
import { useQuery } from "../useQuery";
import { BINARY_INFO_QUERY_KEY, toBinarySymbolsInfo } from "./binaryInfo";
import { usePrivateDataObserver } from "./usePrivateDataObserver";

const SYMBOL = "PERP_BTC5M2609290800_USDC";
const BINARY_ROW = {
  symbol: SYMBOL,
  base_tick: 0.01,
  quote_tick: 0.01,
  imr_factor: 0.000000091,
} as API.BinaryInfoRow;
const position = (overrides: Partial<API.Position> = {}): API.Position =>
  ({
    symbol: SYMBOL,
    position_qty: 0,
    pending_long_qty: 0,
    pending_short_qty: 0,
    margin_mode: "ISOLATED",
    ...overrides,
  }) as API.Position;

let mockAccountId: string | undefined;
let mockStatus: AccountStatusEnum;
let mockBinaryInfo: Record<string, API.SymbolExt>;
const mockMessages = new Map<string, (message: any) => void>();
const mockRequests: Array<{
  path: string;
  accountId?: string;
  settled: boolean;
  resolve: (data: unknown) => void;
  reject: (error: Error) => void;
}> = [];
const mockAccount = { on: jest.fn(), off: jest.fn() };
const mockSetBinaryInfo = jest.fn((info) => {
  mockBinaryInfo = info;
});
const mockActions = {
  setAccountInfo: jest.fn(),
  restoreHolding: jest.fn(),
  cleanAll: jest.fn(),
  setBinarySymbolsInfo: mockSetBinaryInfo,
};
const mockCalculations: Array<{
  accountId?: string;
  positions: API.PositionInfo;
  info: Record<string, API.SymbolExt>;
}> = [];
const mockCalculator = {
  calc: jest.fn((_scope, positions) => {
    mockCalculations.push({
      accountId: mockAccountId,
      positions,
      info: mockBinaryInfo,
    });
  }),
  stop: jest.fn(),
};
const mockStatusActions = {
  updateApiLoading: jest.fn(),
  updateApiError: jest.fn(),
};
const mockPositionActions = { clearAll: jest.fn() };

// Keep the real public/private query hooks, observer and SWR cache. Only the
// transport, account, calculator and unrelated observers are replaced.
jest.mock("@orderly.network/net", () => ({
  get: (url: string) =>
    new Promise((resolve, reject) => {
      mockRequests.push({
        path: new URL(url, "https://api.example.test").pathname,
        accountId: mockAccountId,
        settled: false,
        resolve,
        reject,
      });
    }),
}));
jest.mock("@orderly.network/core", () => ({
  EVENT_NAMES: { statusChanged: "statusChanged" },
}));
jest.mock("@orderly.network/plugin-core", () => ({
  usePluginScope: () => undefined,
}));
jest.mock("../useConfig", () => ({
  useConfig: () => "https://api.example.test",
}));
jest.mock("../middleware/signatureMiddleware", () => ({
  signatureMiddleware: (next: any) => (key: any, fetcher: any, config: any) =>
    next(key, (args: any) => fetcher(args[0], {}), config),
}));
jest.mock("../useAccount", () => ({
  useAccount: () => ({
    state: { accountId: mockAccountId, status: mockStatus },
    account: mockAccount,
  }),
}));
jest.mock("../usePrivateQuery", () => {
  const actual = jest.requireActual("../usePrivateQuery");
  return {
    usePrivateQuery: (url: string, options: unknown) =>
      actual.usePrivateQuery(url === "/v1/positions" ? url : null, options),
  };
});
jest.mock("../useWS", () => ({
  useWS: () => ({
    privateSubscribe: (topic: unknown, handler: any) => {
      if (typeof topic === "string") mockMessages.set(topic, handler.onMessage);
      return () => {
        if (
          typeof topic === "string" &&
          mockMessages.get(topic) === handler.onMessage
        )
          mockMessages.delete(topic);
      };
    },
  }),
}));
jest.mock("../useEventEmitter", () => ({
  useEventEmitter: () => ({ emit: jest.fn() }),
}));
jest.mock("../useLocalStorage", () => ({ useLocalStorage: () => [false] }));
jest.mock("../useCalculatorService", () => ({
  useCalculatorService: () => mockCalculator,
}));
jest.mock("../next/apiStatus/apiStatus.store", () => ({
  useApiStatusActions: () => mockStatusActions,
}));
jest.mock("./appStore", () => ({
  useAppStore: (selector: any) => selector({ actions: mockActions }),
}));
jest.mock("./orderlyHooks", () => ({
  usePositionActions: () => mockPositionActions,
}));
jest.mock("./useBinaryAccountFeeSync", () => ({
  useBinaryAccountFeeSync: () => () => {},
}));

type HarnessProps = { page?: boolean };
function mount({ page = false, warm = false, retry = false } = {}) {
  const cache = new Map();
  if (warm) cache.set(BINARY_INFO_QUERY_KEY, { data: [BINARY_ROW] });
  const wrapper = ({ children }: PropsWithChildren) => (
    <SWRConfig
      value={{
        provider: () => cache,
        // Exercise account isolation even when the host enables this option.
        keepPreviousData: true,
        revalidateOnFocus: false,
        revalidateOnMount: !warm,
        shouldRetryOnError: retry,
      }}
    >
      {children}
    </SWRConfig>
  );
  if (warm)
    cache.set(unstable_serialize(["/v1/positions", mockAccountId]), {
      data: { rows: [position({ position_qty: 1 })] },
    });
  const hooks = renderHook(
    ({ page }: HarnessProps) => {
      const { mutate } = useSWRConfig();
      const pageQuery = useQuery<API.BinaryInfoRow[]>(
        page ? BINARY_INFO_QUERY_KEY : null,
        { refreshInterval: 30_000 },
      );
      usePrivateDataObserver({ getKeysMap: () => new Map() });
      return { pageQuery, mutate };
    },
    { wrapper, initialProps: { page } },
  );
  return { ...hooks, cache };
}

const binaryRequests = () =>
  mockRequests.filter((request) => request.path === BINARY_INFO_QUERY_KEY);
async function complete(
  path: string,
  data: unknown,
  accountId = mockAccountId,
) {
  const request = mockRequests.find(
    (request) =>
      request.path === path &&
      request.accountId === accountId &&
      !request.settled,
  );
  expect(request).toBeDefined();
  request!.settled = true;
  await act(async () => request!.resolve(data));
}
const loadPositions = (rows: API.Position[], accountId = mockAccountId) =>
  complete("/v1/positions", { rows }, accountId);
async function sendPosition(overrides: Record<string, unknown>) {
  await act(async () => {
    mockMessages.get("position")!({
      positions: [
        {
          symbol: SYMBOL,
          marginMode: "ISOLATED",
          positionQty: 0,
          pendingLongQty: 0,
          pendingShortQty: 0,
          averageOpenPrice: 0.5,
          ...overrides,
        },
      ],
    });
  });
}
async function tick(ms: number) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockAccountId = "A";
  mockStatus = AccountStatusEnum.EnableTrading;
  mockBinaryInfo = {};
  mockRequests.length = 0;
  mockCalculations.length = 0;
  mockMessages.clear();
});
afterEach(() => jest.useRealTimers());

test.each([
  { position_qty: 1 },
  { position_qty: -1 },
  { pending_long_qty: 1 },
  { pending_short_qty: 1 },
])(
  "loads metadata for raw Binary exposure %o without a Prediction page",
  async (row) => {
    mount();
    await loadPositions([position(row)]);
    expect(binaryRequests()).toHaveLength(1);
    await complete(BINARY_INFO_QUERY_KEY, [BINARY_ROW]);
    expect(mockCalculations.at(-1)?.info[SYMBOL]).toEqual(
      expect.objectContaining({ base_imr: 1, base_mmr: 0 }),
    );
  },
);

test.each([
  { rows: [] },
  { rows: [position()] },
  { rows: [position({ symbol: "PERP_BTC_USDC", position_qty: 1 })] },
  { rows: [position({ symbol: "PERP_BTC_USDC", pending_long_qty: 1 })] },
])(
  "does not request metadata for rows without Binary exposure: %o",
  async ({ rows }) => {
    mount();
    await loadPositions(rows);
    expect(binaryRequests()).toHaveLength(0);
    expect(mockCalculator.calc).toHaveBeenCalledWith(CalculatorScope.POSITION, {
      rows,
    });
  },
);

test("recalculates after metadata arrives and on cache updates, using the latest raw rows", async () => {
  const { result } = mount();
  await loadPositions([position({ position_qty: 1 })]);
  expect(mockCalculations.at(-1)?.info).toEqual({});
  await sendPosition({ positionQty: 2 });
  await complete(BINARY_INFO_QUERY_KEY, [BINARY_ROW]);
  expect(mockCalculations.at(-1)?.positions.rows[0].position_qty).toBe(2);
  expect(mockCalculations.at(-1)?.info[SYMBOL].quote_dp).toBe(2);

  // A second observer/page can update the shared cache without a position tick.
  const count = mockCalculations.length;
  await act(async () => {
    await result.current.mutate(
      BINARY_INFO_QUERY_KEY,
      [{ ...BINARY_ROW, quote_tick: 0.001 }],
      { revalidate: false },
    );
  });
  expect(mockCalculations).toHaveLength(count + 1);
  expect(mockCalculations.at(-1)?.info[SYMBOL].quote_dp).toBe(3);
});

test("uses a warm cache without a request and does not recalculate on unrelated renders", () => {
  const { rerender } = mount({ warm: true });
  expect(binaryRequests()).toHaveLength(0);
  expect(mockCalculations.at(-1)?.info).toEqual(
    toBinarySymbolsInfo([BINARY_ROW]),
  );
  const count = mockCalculations.length;
  rerender({ page: false });
  expect(mockCalculations).toHaveLength(count);
});

test("starts and stops polling as WebSocket exposure changes", async () => {
  jest.useFakeTimers();
  mount();
  await loadPositions([]);
  await sendPosition({ pendingLongQty: 1 });
  expect(binaryRequests()).toHaveLength(1);
  await complete(BINARY_INFO_QUERY_KEY, [BINARY_ROW]);
  await tick(60_000);
  expect(binaryRequests()).toHaveLength(2);
  await complete(BINARY_INFO_QUERY_KEY, [BINARY_ROW]);
  await sendPosition({});
  const count = mockCalculations.length;
  await tick(180_000);
  expect(binaryRequests()).toHaveLength(2);
  expect(mockCalculations).toHaveLength(count);
  expect(mockBinaryInfo).toEqual(toBinarySymbolsInfo([BINARY_ROW]));
});

test("shares a page request and keeps page polling after account exposure disappears", async () => {
  jest.useFakeTimers();
  const { result } = mount({ page: true });
  await loadPositions([position({ position_qty: 1 })]);
  expect(binaryRequests()).toHaveLength(1);
  await complete(BINARY_INFO_QUERY_KEY, [BINARY_ROW]);
  expect(result.current.pageQuery.data).toEqual([BINARY_ROW]);
  await sendPosition({});
  const calculations = mockCalculations.length;
  await tick(30_000);
  expect(binaryRequests()).toHaveLength(2);
  await complete(BINARY_INFO_QUERY_KEY, [{ ...BINARY_ROW, quote_tick: 0.001 }]);
  expect(result.current.pageQuery.data?.[0].quote_tick).toBe(0.001);
  expect(mockCalculations).toHaveLength(calculations);
});

test("switching accounts ignores late metadata", async () => {
  const { rerender } = mount();
  await loadPositions([position({ position_qty: 1 })]);
  mockAccountId = "B";
  rerender({ page: false });
  const count = mockCalculations.length;
  await complete(BINARY_INFO_QUERY_KEY, [BINARY_ROW], "A");
  expect(mockCalculations).toHaveLength(count);
  expect(mockSetBinaryInfo).not.toHaveBeenCalled();
  await loadPositions([position({ symbol: "PERP_ETH_USDC", position_qty: 1 })]);
  expect(mockCalculations.at(-1)?.accountId).toBe("B");
  expect(binaryRequests()).toHaveLength(1);
});

test("a late position response from the previous account cannot enable metadata loading", async () => {
  const { rerender } = mount();
  mockAccountId = "B";
  rerender({ page: false });
  await loadPositions([position({ position_qty: 1 })], "A");
  expect(binaryRequests()).toHaveLength(0);
  expect(mockCalculations).toHaveLength(0);
  await loadPositions([]);
  expect(mockCalculations.at(-1)?.positions.rows).toEqual([]);
  expect(mockCalculations.at(-1)?.accountId).toBe("B");
});

test("closing the page preserves account polling for an existing position", async () => {
  jest.useFakeTimers();
  const { rerender } = mount({ page: true });
  await loadPositions([position({ position_qty: 1 })]);
  await complete(BINARY_INFO_QUERY_KEY, [BINARY_ROW]);
  rerender({ page: false });
  await tick(60_000);
  expect(binaryRequests()).toHaveLength(2);
  await complete(BINARY_INFO_QUERY_KEY, [{ ...BINARY_ROW, quote_tick: 0.001 }]);
  expect(mockCalculations.at(-1)?.info[SYMBOL].quote_dp).toBe(3);
});

test.each(["logout", "permission"])(
  "%s stops demand and ignores late metadata",
  async (reason) => {
    jest.useFakeTimers();
    const { rerender } = mount();
    await loadPositions([position({ position_qty: 1 })]);
    if (reason === "logout") mockAccountId = undefined;
    else mockStatus = AccountStatusEnum.NotConnected;
    rerender({ page: false });
    const count = mockCalculations.length;
    await complete(BINARY_INFO_QUERY_KEY, [BINARY_ROW], "A");
    await tick(180_000);
    expect(binaryRequests()).toHaveLength(1);
    expect(mockCalculations).toHaveLength(count);
    expect(mockSetBinaryInfo).not.toHaveBeenCalled();
  },
);

test("stops error retries when exposure disappears", async () => {
  jest.useFakeTimers();
  mount({ retry: true });
  await loadPositions([position({ pending_short_qty: 1 })]);
  const request = binaryRequests()[0];
  request.settled = true;
  await act(async () => request.reject(new Error("unavailable")));
  await sendPosition({});
  await tick(180_000);
  expect(binaryRequests()).toHaveLength(1);
  expect(mockBinaryInfo).toEqual({});
});

test("read-only trading status still loads metadata", async () => {
  mockStatus = AccountStatusEnum.EnableTradingWithoutConnected;
  mount();
  await loadPositions([position({ position_qty: -1 })]);
  expect(binaryRequests()).toHaveLength(1);
});
