// @vitest-environment jsdom
import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import useSWR, { SWRConfig, useSWRConfig } from "swr";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { BinaryInfoDetail } from "@orderly.network/prediction/src/prediction/binary/binaryInfo";
import { useBinaryRounds } from "@orderly.network/prediction/src/prediction/binary/useBinaryRounds";

vi.mock("@orderly.network/hooks", () => ({
  useSWRConfig,
  useQuery: (key: string | null, options: object) => useSWR(key, options),
  useLocalStorage: (_key: string, initial: unknown) => useState(initial),
}));
vi.mock("@orderly.network/utils", async () => ({
  ...(await vi.importActual("@orderly.network/utils")),
  getTimestamp: () => Date.now(),
}));

const T0 = Date.UTC(2026, 9, 13, 1, 45);
const row: BinaryInfoDetail = {
  symbol: "PERP_BTC5M2610130145_USDC",
  product_type: "BINARY",
  fee_model: "BINARY_PROBABILITY",
  status: "ACTIVE",
  activated_at: T0 - 60_000,
  observation_start_at: T0,
  expire_at: T0 + 300_000,
  index_price_symbol: "PERP_BTC_USDC",
  s0: null,
};
const INFO_KEY = "/v1/public/binary/info";
const detailKey = (symbol: string) => `${INFO_KEY}/${symbol}`;
let snapshot: BinaryInfoDetail[];
let publishedPrice: number | null;
let result: Partial<BinaryInfoDetail> | undefined;
let failDetail: boolean;
let deferredDetail: ((key: string) => Promise<BinaryInfoDetail>) | undefined;
let state: ReturnType<typeof useBinaryRounds>;
let root: ReturnType<typeof createRoot>;
let container: HTMLDivElement;
let mutate: ReturnType<typeof useSWRConfig>["mutate"];
let renderBudget: number;
const fetcher = vi.fn(async (key: string) => {
  if (key === INFO_KEY) return snapshot;
  if (deferredDetail) return deferredDetail(key);
  if (failDetail) throw new Error("Binary info unavailable");
  return {
    ...row,
    symbol: key.slice(INFO_KEY.length + 1),
    s0: publishedPrice,
    ...result,
  };
});
const cache = () => new Map();
const onSymbolSelect = vi.fn();

function Probe({ active, symbol }: { active: boolean; symbol: string }) {
  if (--renderBudget < 0) throw new Error("Round state did not stabilize");
  mutate = useSWRConfig().mutate;
  // Match the global observer sharing the slow snapshot query.
  useSWR(INFO_KEY, { refreshInterval: 60_000, dedupingInterval: 30_000 });
  state = useBinaryRounds({ active, symbol, onSymbolSelect });
  return null;
}
const config = {
  provider: cache,
  fetcher,
  dedupingInterval: 30_000,
  revalidateOnFocus: false,
};
async function render(active = true, symbol = row.symbol) {
  await act(async () => {
    root.render(
      <SWRConfig value={{ ...config, fallback: { [INFO_KEY]: snapshot } }}>
        <Probe active={active} symbol={symbol} />
      </SWRConfig>,
    );
  });
}
async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}
function detailRequests(symbol = row.symbol) {
  return fetcher.mock.calls.filter(([key]) => key === detailKey(symbol));
}
beforeEach(() => {
  (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
  vi.useFakeTimers();
  vi.setSystemTime(T0 - 1_000);
  fetcher.mockClear();
  snapshot = [row];
  publishedPrice = null;
  result = undefined;
  failDetail = false;
  deferredDetail = undefined;
  vi.spyOn(Math, "random").mockReturnValue(0.5);
  renderBudget = Infinity;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

it("fetches at T0, retries a missing S0 every 2s, then stops while the snapshot stays stale", async () => {
  await render();
  expect(detailRequests()).toHaveLength(0);
  expect(state.openingPrice).toBeUndefined();
  await advance(1_005);
  expect(detailRequests()).toHaveLength(1);
  expect(state.openingPrice).toBeUndefined();
  await advance(2_000);
  expect(detailRequests()).toHaveLength(2);
  publishedPrice = 82_299.29;
  await advance(2_000);
  expect(detailRequests()).toHaveLength(3);
  expect(state.openingPrice).toBe(publishedPrice);
  expect(state.selectedRow?.s0).toBe(publishedPrice);
  expect(state.marketRows[0].s0).toBe(publishedPrice);
  await advance(20_000);
  expect(detailRequests()).toHaveLength(3);
  expect(state.openingPrice).toBe(publishedPrice);
  await advance(row.expire_at + 5 - Date.now());
  expect(state.openingPrice).toBe(publishedPrice);
  expect(state.selectedRow?.s0).toBe(publishedPrice);
});

it("fetches immediately when mounting a round that already started", async () => {
  vi.setSystemTime(T0 + 34_000);
  publishedPrice = 82_299.29;
  await render();
  expect(detailRequests()).toHaveLength(1);
  expect(state.openingPrice).toBe(publishedPrice);
});

it("does not fetch live details when the snapshot already contains S0", async () => {
  vi.setSystemTime(T0 + 34_000);
  snapshot = [{ ...row, s0: 82_299.29 }];
  await render();
  await advance(10_000);
  expect(detailRequests()).toHaveLength(0);
  expect(state.openingPrice).toBe(82_299.29);
});

it("suspends opening polls while inactive and catches up on reactivation", async () => {
  await render(false);
  await advance(4_000);
  expect(detailRequests()).toHaveLength(0);
  await render();
  expect(detailRequests()).toHaveLength(1);
  await render(false);
  await advance(6_000);
  expect(detailRequests()).toHaveLength(1);
  publishedPrice = 82_299.29;
  await render();
  await advance(2_000);
  expect(state.openingPrice).toBe(publishedPrice);
});

it("does not carry the previous round's opening price into a future selection", async () => {
  const next = {
    ...row,
    symbol: "PERP_BTC5M2610130150_USDC",
    observation_start_at: T0 + 300_000,
    expire_at: T0 + 600_000,
  };
  snapshot = [row, next];
  vi.setSystemTime(T0 + 34_000);
  publishedPrice = 82_299.29;
  await render();
  expect(state.openingPrice).toBe(publishedPrice);
  await render(true, next.symbol);
  expect(state.openingPrice).toBeUndefined();
  expect(detailRequests(next.symbol)).toHaveLength(0);
});

it("starts result polling at T1 with jitter and no grace period", async () => {
  snapshot = [{ ...row, s0: 82_299.29 }];
  vi.setSystemTime(row.expire_at - 1_000);
  await render();
  await advance(1_005);
  expect(detailRequests()).toHaveLength(1);
  expect(state.openingPrice).toBe(82_299.29);
  await advance(2_499);
  expect(detailRequests()).toHaveLength(1);
  await advance(1);
  expect(detailRequests()).toHaveLength(2);
});

it("restarts immediately at T1 when an opening query already has S0", async () => {
  vi.setSystemTime(row.expire_at - 1_000);
  publishedPrice = 82_299.29;
  await render();
  expect(detailRequests()).toHaveLength(1);
  await advance(1_005);
  expect(detailRequests()).toHaveLength(2);
});

it.each([false, true])(
  "restarts paused detail polling at T1 after a round with S0 leaves the snapshot (initial error=%s)",
  async (initialError) => {
    snapshot = [{ ...row, s0: 100 }];
    vi.setSystemTime(row.expire_at - 10_000);
    publishedPrice = 100;
    failDetail = initialError;
    await render();
    await act(async () => {
      snapshot = [];
      await mutate(INFO_KEY, snapshot, false);
    });
    expect(state.isRoundInSnapshot).toBe(false);
    expect(detailRequests()).toHaveLength(1);
    await advance(9_999);
    expect(detailRequests()).toHaveLength(1);

    failDetail = false;
    await advance(6);
    expect(state.roundPhase).toBe("closed");
    expect(detailRequests()).toHaveLength(2);
    await advance(2_499);
    expect(detailRequests()).toHaveLength(2);
    await advance(1);
    expect(detailRequests()).toHaveLength(3);

    result = {
      s0: 100,
      s1: 100,
      outcome: "TIE",
      settlement_price_per_share: 0.5,
      result_committed_at: row.expire_at + 1_000,
    };
    await advance(2_500);
    expect(state.roundPhase).toBe("resolvedTie");
    const count = detailRequests().length;
    await advance(20_000);
    expect(detailRequests()).toHaveLength(count);
  },
);

it("fetches an expired round outside the snapshot once before starting result polls", async () => {
  snapshot = [];
  vi.setSystemTime(row.expire_at);
  publishedPrice = 100;
  await render();
  expect(state.selectedRow?.symbol).toBe(row.symbol);
  expect(state.roundPhase).toBe("closed");
  expect(detailRequests()).toHaveLength(1);
  await advance(2_500);
  expect(detailRequests()).toHaveLength(2);
});

it("polls every 10s after the first 30s of an unresolved round", async () => {
  vi.setSystemTime(row.expire_at + 30_000);
  await render();
  expect(detailRequests()).toHaveLength(1);
  await advance(9_999);
  expect(detailRequests()).toHaveLength(1);
  await advance(1);
  expect(detailRequests()).toHaveLength(2);
});

it("stops after an official Tie without waiting for price evidence or personal history", async () => {
  vi.setSystemTime(row.expire_at);
  publishedPrice = 100;
  await render();
  result = {
    s0: 100,
    s1: 100,
    outcome: "TIE",
    settlement_price_per_share: 0.5,
    result_committed_at: row.expire_at + 1_000,
    price_evidence: null,
  };
  await advance(2_500);
  expect(state.roundPhase).toBe("resolvedTie");
  const count = detailRequests().length;
  await advance(20_000);
  expect(detailRequests()).toHaveLength(count);
});

it("recovers API failures on the polling cadence and cancels retries when inactive", async () => {
  vi.setSystemTime(row.expire_at);
  failDetail = true;
  await render();
  expect(state.detailError).toBeDefined();
  expect(detailRequests()).toHaveLength(1);
  await advance(2_500);
  expect(detailRequests()).toHaveLength(2);
  failDetail = false;
  await advance(2_500);
  expect(detailRequests()).toHaveLength(3);
  expect(state.detailError).toBeUndefined();
  await render(false);
  await advance(20_000);
  expect(detailRequests()).toHaveLength(3);
});

it("does not retry a missing expired round after its detail request fails", async () => {
  snapshot = [];
  vi.setSystemTime(row.expire_at + 60_000);
  failDetail = true;
  await render();
  expect(state.selectedRow).toBeUndefined();
  expect(state.detailError).toBeDefined();
  expect(detailRequests()).toHaveLength(1);
  await advance(31_000);
  expect(detailRequests()).toHaveLength(1);
  expect(state.isLoading).toBe(false);
});

it("retries opening-price failures and stops when the snapshot publishes S0", async () => {
  vi.setSystemTime(T0 + 34_000);
  failDetail = true;
  await render();
  expect(state.selectedRow?.symbol).toBe(row.symbol);
  expect(detailRequests()).toHaveLength(1);
  await advance(2_000);
  expect(detailRequests()).toHaveLength(2);
  await act(async () => {
    snapshot = [{ ...row, s0: 100 }];
    await mutate(INFO_KEY, snapshot, false);
  });
  expect(state.openingPrice).toBe(100);
  await advance(10_000);
  expect(detailRequests()).toHaveLength(2);
});

it("keeps retrying a retained round after it leaves the snapshot until its result arrives", async () => {
  vi.setSystemTime(row.expire_at + 60_000);
  failDetail = true;
  await render();
  await act(async () => {
    snapshot = [];
    await mutate(INFO_KEY, snapshot, false);
  });
  expect(state.isRoundInSnapshot).toBe(false);
  expect(state.selectedRow?.symbol).toBe(row.symbol);
  await advance(10_000);
  expect(detailRequests()).toHaveLength(2);
  failDetail = false;
  result = {
    s0: 100,
    s1: 100,
    outcome: "TIE",
    settlement_price_per_share: 0.5,
    result_committed_at: row.expire_at + 1_000,
  };
  await advance(10_000);
  expect(detailRequests()).toHaveLength(3);
  expect(state.roundPhase).toBe("resolvedTie");
  await advance(20_000);
  expect(detailRequests()).toHaveLength(3);
});

it("retries settlement failures for a round loaded only from details", async () => {
  snapshot = [];
  vi.setSystemTime(row.expire_at + 60_000);
  publishedPrice = 100;
  await render();
  expect(state.selectedRow?.symbol).toBe(row.symbol);
  expect(state.isRoundInSnapshot).toBe(false);
  failDetail = true;
  await advance(10_000);
  expect(state.detailError).toBeDefined();
  expect(detailRequests()).toHaveLength(2);
  await advance(10_000);
  expect(detailRequests()).toHaveLength(3);
  expect(state.selectedRow?.symbol).toBe(row.symbol);
});

it("replaces the old round's result schedule when switching symbols and unmounting", async () => {
  const next = {
    ...row,
    symbol: "PERP_BTC5M2610130150_USDC",
    observation_start_at: row.expire_at,
    expire_at: row.expire_at + 300_000,
    s0: 100,
  };
  snapshot = [{ ...row, s0: 100 }, next];
  vi.setSystemTime(row.expire_at);
  await render();
  expect(detailRequests()).toHaveLength(1);
  await render(true, next.symbol);
  await advance(20_000);
  expect(detailRequests()).toHaveLength(1);
  expect(detailRequests(next.symbol)).toHaveLength(0);
  act(() => root.unmount());
  root = createRoot(container);
  await advance(20_000);
  expect(detailRequests()).toHaveLength(1);
});

it("retains cached S0 without a render loop after the round leaves the snapshot", async () => {
  snapshot = [{ ...row, s0: 82_299.29 }];
  vi.setSystemTime(T0 + 34_000);
  await render();
  expect(state.openingPrice).toBe(82_299.29);
  // Limit renders so a regression fails instead of hanging the test runner.
  renderBudget = 20;
  await act(async () => {
    await mutate(detailKey(row.symbol), { ...row, s0: null }, false);
    snapshot = [];
    await mutate(INFO_KEY, snapshot, false);
  });
  expect(state.isRoundInSnapshot).toBe(false);
  expect(state.openingPrice).toBe(82_299.29);
  const selected = state.selectedRow;
  await advance(6_000);
  expect(detailRequests().length).toBeGreaterThan(0);
  expect(state.selectedRow).toBe(selected);
  expect(state.openingPrice).toBe(82_299.29);
});

it("ignores a late error for a previously selected symbol and falls back on the current request's network error", async () => {
  vi.setSystemTime(T0 + 34_000);
  const oldSymbol = "PERP_BTC5M2610120145_USDC";
  const newSymbol = "PERP_BTC5M2610140145_USDC";
  let rejectOld!: (reason: Error) => void;
  let rejectNew!: (reason: Error) => void;
  deferredDetail = (key) =>
    new Promise<BinaryInfoDetail>((_resolve, reject) => {
      if (key === detailKey(oldSymbol)) rejectOld = reject;
      else if (key === detailKey(newSymbol)) rejectNew = reject;
    });
  await render(true, oldSymbol);
  // Complete the snapshot query while the detail request stays pending.
  await act(async () => {
    await mutate(INFO_KEY);
  });
  expect(detailRequests(oldSymbol)).toHaveLength(1);
  await render(true, newSymbol);
  expect(detailRequests(newSymbol)).toHaveLength(1);
  await act(async () => rejectOld(new Error("Network request failed")));
  expect(state.detailError).toBeUndefined();
  expect(state.isLoading).toBe(true);
  expect(state.missingRoundFallbackRow).toBeUndefined();
  await act(async () => rejectNew(new Error("Network request failed")));
  expect(state.detailError?.message).toBe("Network request failed");
  expect(state.detailLoading).toBe(false);
  expect(state.isLoading).toBe(false);
  expect(state.missingRoundFallbackRow?.symbol).toBe(row.symbol);
  await render(false, newSymbol);
  expect(state.missingRoundFallbackRow).toBeUndefined();
});
