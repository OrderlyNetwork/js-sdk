import { createElement, useEffect } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { SWRConfig, unstable_serialize, type Cache } from "swr";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { usePredictionSettlementHistory } from "@orderly.network/prediction/src/prediction/hooks/usePredictionSettlementHistory";
import { AccountStatusEnum } from "@orderly.network/types";

const mocks = vi.hoisted(() => ({ accountId: "a", get: vi.fn() }));
vi.mock("@orderly.network/hooks", async () => ({
  ...(await vi.importActual("swr")),
  ...(await vi.importActual("@orderly.network/hooks/src/shared/useMemoizedFn")),
  ...(await vi.importActual("@orderly.network/hooks/src/usePrivateQuery")),
}));
vi.mock("@orderly.network/hooks/src/useAccount", () => ({
  useAccount: () => ({
    state: {
      accountId: mocks.accountId,
      status: AccountStatusEnum.EnableTrading,
    },
  }),
}));
vi.mock("@orderly.network/hooks/src/useConfig", () => ({
  useConfig: () => "",
}));
vi.mock("@orderly.network/core", () => ({
  SimpleDI: {
    get: () => ({
      accountId: mocks.accountId,
      signer: { sign: async () => ({}) },
    }),
  },
}));
vi.mock("@orderly.network/net", () => ({
  get: async (
    url: string,
    init: RequestInit,
    formatter: (data: unknown) => unknown,
  ) => formatter(await mocks.get(url, init)),
}));
vi.mock("@orderly.network/utils", async () => ({
  ...(await vi.importActual("@orderly.network/utils")),
  getTimestamp: () => Date.now(),
}));

const query = "/v1/position_history?product_type=BINARY&limit=1000";
const settled = {
  position_id: 1,
  symbol: "PERP_BTC5M2601010000_USDC",
  side: "LONG",
  position_status: "closed",
  type: "trade",
  closed_position_qty: 10,
  avg_open_price: 0.5,
  avg_close_price: 1,
  realized_pnl: 5,
  trading_fee: 0,
  open_timestamp: Date.UTC(2026, 0, 1),
  close_timestamp: Date.UTC(2026, 0, 1, 0, 6),
  last_update_time: Date.UTC(2026, 0, 1, 0, 6),
  outcome: "UP",
  settlement_price_per_share: 1,
  settled_at: Date.UTC(2026, 0, 1, 0, 6),
};
let root: ReactTestRenderer | undefined;
let cache: Cache;
let config: { provider: () => Cache; shouldRetryOnError: boolean };
let states: ReturnType<typeof usePredictionSettlementHistory>[];

function Consumer({ index, enabled }: { index: number; enabled: boolean }) {
  const state = usePredictionSettlementHistory({
    accountId: mocks.accountId,
    enabled,
    includeSettlementHistory: true,
  });
  useEffect(() => {
    states[index] = state;
  }, [index, state]);
  return null;
}

async function render(count = 3, enabled = true) {
  await act(async () => {
    const tree = createElement(
      SWRConfig,
      { value: config },
      Array.from({ length: count }, (_, index) =>
        createElement(Consumer, { key: index, index, enabled }),
      ),
    );
    if (root) root.update(tree);
    else root = create(tree);
  });
}
async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(Date.UTC(2026, 9, 16));
  mocks.accountId = "a";
  mocks.get.mockReset().mockResolvedValue({ rows: [] });
  cache = new Map();
  config = { provider: () => cache, shouldRetryOnError: false };
  states = [];
});
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  vi.useRealTimers();
});

it("shares the automatic initial fetch and each heartbeat across three real SWR consumers", async () => {
  await render();
  expect(mocks.get).toHaveBeenCalledTimes(1);
  await advance(59_999);
  expect(mocks.get).toHaveBeenCalledTimes(1);
  await advance(1);
  expect(mocks.get).toHaveBeenCalledTimes(2);
  await advance(60_000);
  expect(mocks.get).toHaveBeenCalledTimes(3);
  expect(states.every((state) => !state.historyLoading)).toBe(true);
});

it("skips polling while the automatic initial request is still validating", async () => {
  let resolve!: (data: { rows: [] }) => void;
  mocks.get.mockReturnValueOnce(
    new Promise((done) => {
      resolve = done;
    }),
  );
  await render();
  expect(mocks.get).toHaveBeenCalledTimes(1);
  await advance(120_000);
  expect(mocks.get).toHaveBeenCalledTimes(1);
  await act(async () => resolve({ rows: [] }));
  await advance(60_000);
  expect(mocks.get).toHaveBeenCalledTimes(2);
});

it("reads validation state from the current cache even without a consumer rerender", async () => {
  await render();
  const key = unstable_serialize([query, "a"]);
  // Simulate a revalidation starting between the last render and the timer.
  // No cache broadcast or React rerender updates a captured hook flag.
  cache.set(key, { ...cache.get(key), isValidating: true });
  await advance(60_000);
  expect(mocks.get).toHaveBeenCalledTimes(1);
  cache.set(key, { ...cache.get(key), isValidating: false });
  await advance(60_000);
  expect(mocks.get).toHaveBeenCalledTimes(2);
});

it("shares five-second settlement polling and slows to one-minute heartbeats after confirmation", async () => {
  mocks.get
    .mockResolvedValueOnce({
      rows: [
        {
          ...settled,
          position_status: "open",
          outcome: undefined,
          settlement_price_per_share: undefined,
          settled_at: undefined,
        },
      ],
    })
    .mockResolvedValue({ rows: [settled] });
  await render();
  expect(mocks.get).toHaveBeenCalledTimes(1);
  expect(
    states.every((state) => state.pendingSettlementSymbols.length === 1),
  ).toBe(true);
  await advance(4_999);
  expect(mocks.get).toHaveBeenCalledTimes(1);
  await advance(1);
  expect(mocks.get).toHaveBeenCalledTimes(2);
  expect(
    states.every(
      (state) =>
        state.pendingSettlementSymbols.length === 0 &&
        state.historyRecords[0]?.state === "settled",
    ),
  ).toBe(true);
  await advance(59_999);
  expect(mocks.get).toHaveBeenCalledTimes(2);
  await advance(1);
  expect(mocks.get).toHaveBeenCalledTimes(3);
});

it("stops disabled consumers and replaces the old account's polling on account switch", async () => {
  await render();
  await render(3, false);
  await advance(60_000);
  expect(mocks.get).toHaveBeenCalledTimes(1);
  mocks.accountId = "b";
  await render();
  expect(mocks.get).toHaveBeenCalledTimes(2);
  await advance(60_000);
  expect(mocks.get).toHaveBeenCalledTimes(3);
  expect(
    mocks.get.mock.calls.map(([, init]) => init.headers["orderly-account-id"]),
  ).toEqual(["a", "b", "b"]);
});

it("does not leak an old account's in-flight response or restart its polling after switching", async () => {
  let resolve!: (data: { rows: (typeof settled)[] }) => void;
  mocks.get.mockReturnValueOnce(
    new Promise((done) => {
      resolve = done;
    }),
  );
  await render();
  mocks.accountId = "b";
  await render();
  expect(mocks.get).toHaveBeenCalledTimes(2);
  await act(async () => resolve({ rows: [settled] }));
  expect(states.every((state) => state.historyRecords.length === 0)).toBe(true);
  await advance(60_000);
  expect(mocks.get).toHaveBeenCalledTimes(3);
  expect(
    mocks.get.mock.calls.map(([, init]) => init.headers["orderly-account-id"]),
  ).toEqual(["a", "b", "b"]);
});
