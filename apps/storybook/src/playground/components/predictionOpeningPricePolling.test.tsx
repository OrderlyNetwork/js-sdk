// @vitest-environment jsdom
import React, { act, useState } from "react";
import { createRoot } from "react-dom/client";
import useSWR, { SWRConfig, useSWRConfig } from "swr";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { BinaryInfoDetail } from "@orderly.network/prediction/src/prediction/binary/binaryInfo";
import { useBinaryRounds } from "@orderly.network/prediction/src/prediction/binary/useBinaryRounds";

vi.mock("@orderly.network/hooks", () => ({
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
let state: ReturnType<typeof useBinaryRounds>;
let root: ReturnType<typeof createRoot>;
let container: HTMLDivElement;
let mutate: ReturnType<typeof useSWRConfig>["mutate"];
let renderBudget: number;
const fetcher = vi.fn(async (key: string) => {
  if (key === INFO_KEY) return snapshot;
  return { ...row, symbol: key.slice(INFO_KEY.length + 1), s0: publishedPrice };
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
  renderBudget = Infinity;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
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

it("keeps the existing post-expiry grace period and result polling", async () => {
  snapshot = [{ ...row, s0: 82_299.29 }];
  vi.setSystemTime(row.expire_at - 1_000);
  await render();
  await advance(1_005);
  expect(detailRequests()).toHaveLength(0);
  await advance(5_000);
  expect(detailRequests()).toHaveLength(1);
  expect(state.openingPrice).toBe(82_299.29);
  await advance(5_000);
  expect(detailRequests()).toHaveLength(2);
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
