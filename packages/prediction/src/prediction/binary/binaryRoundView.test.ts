import assert from "node:assert/strict";
import test from "node:test";
import { deriveBinaryPhase, type BinaryInfoRow } from "./binaryInfo";
import { deriveBinaryMarkets } from "./binaryMarkets";
import { getBinaryQuotes } from "./binaryQuotes";
import {
  getPriceDifference,
  getRoundNavigation,
  getRoundPrices,
  getRoundStatus,
  getViewableRounds,
  mergeIndexPoints,
  secondsUntil,
} from "./binaryRoundView";

const t0 = Date.UTC(2026, 9, 8, 10, 0);
const row = (
  start = t0,
  overrides: Partial<BinaryInfoRow> = {},
): BinaryInfoRow => ({
  symbol: `PERP_BTC5M${new Date(start).toISOString().replace(/[-:T]/g, "").slice(2, 12)}_USDC`,
  product_type: "BINARY",
  fee_model: "BINARY_PROBABILITY",
  status: "ACTIVE",
  activated_at: start - 60_000,
  observation_start_at: start,
  expire_at: start + 300_000,
  index_price_symbol: "PERP_BTC_USDC",
  s0: null,
  ...overrides,
});

test("future countdown targets T0 while every tooltip targets its own T1", () => {
  const now = t0 + 120_000;
  const future = row(t0 + 300_000);
  const farFuture = row(t0 + 900_000);
  assert.equal(secondsUntil(future.observation_start_at, now), 180);
  assert.equal(secondsUntil(future.expire_at, now), 480);
  assert.equal(secondsUntil(farFuture.expire_at, now), 1080);
  assert.equal(getRoundStatus(future, now), "upcoming");
  assert.equal(getRoundStatus(future, future.observation_start_at), "live");
  assert.equal(getRoundStatus(future, future.expire_at), "ended");
  assert.equal(secondsUntil(future.expire_at, future.expire_at + 1), 0);
});

test("navigation leaves missing main slots empty and excludes unready future rows", () => {
  const rows = [
    row(t0 - 300_000),
    row(),
    row(t0 + 600_000),
    row(t0 + 300_000, { status: "PREOPEN" as BinaryInfoRow["status"] }),
  ];
  const navigation = getRoundNavigation(
    rows,
    t0 / 1000,
    t0 / 1000,
    300,
    t0 + 1,
  );
  assert.equal(navigation.visible[0]?.observation_start_at, t0 - 300_000);
  assert.equal(navigation.visible[1]?.observation_start_at, t0);
  assert.equal(navigation.visible[2], undefined);
  assert.deepEqual(
    navigation.future.map((item) => item.observation_start_at),
    [t0 + 600_000],
  );
});

test("future-only defaults to nearest real round, and More retains over eight options", () => {
  const future = Array.from({ length: 12 }, (_, index) =>
    row(t0 + (index + 1) * 300_000),
  );
  const markets = deriveBinaryMarkets([...future].reverse(), t0);
  assert.equal(markets[0].currentRow.symbol, future[0].symbol);
  const navigation = getRoundNavigation(
    future,
    (t0 + 300_000) / 1000,
    (t0 + 300_000) / 1000,
    300,
    t0,
  );
  assert.equal(navigation.future.length, 12);
  assert.deepEqual(
    navigation.future.slice(8).map((item) => item.symbol),
    future.slice(8).map((item) => item.symbol),
  );
});

test("historical selections remain visible as the default live round advances", () => {
  const past = row(t0 - 300_000);
  const live = row();
  const next = row(t0 + 300_000);
  const rows = [past, live, next, row(t0 - 86_700_000)];
  assert.equal(getViewableRounds(rows, t0 + 1).length, 3);
  const selected = t0 / 1000;
  const navigation = getRoundNavigation(
    rows,
    (t0 + 300_000) / 1000,
    selected,
    300,
    t0 + 300_001,
  );
  assert.ok(navigation.visible.some((item) => item?.symbol === live.symbol));
  assert.equal(getRoundStatus(live, t0 + 300_001), "ended");
});

test("navigation fills three real rounds at the end of the schedule", () => {
  const rows = [row(t0 - 900_000), row(t0 - 600_000), row(t0 - 300_000), row()];
  for (const selectedRound of [t0 / 1000, (t0 - 300_000) / 1000]) {
    const navigation = getRoundNavigation(
      [...rows].reverse(),
      t0 / 1000,
      selectedRound,
      300,
      t0 + 1,
    );
    assert.deepEqual(navigation.visible, rows.slice(-3));
    assert.equal(navigation.future.length, 0);
  }
  const navigation = getRoundNavigation(
    [row()],
    t0 / 1000,
    t0 / 1000,
    300,
    t0 + 1,
  );
  assert.equal(navigation.visible.length, 1);
  assert.equal(navigation.visible[0]?.observation_start_at, t0);
});

test("official S0 and S1 are the sole target and final prices", () => {
  const missing = row();
  assert.deepEqual(getRoundPrices(missing, 68_123, t0 + 1), {
    opening: undefined,
    current: 68_123,
  });
  assert.deepEqual(getRoundPrices(missing, 68_123, missing.expire_at), {
    opening: undefined,
    current: undefined,
  });
  const resolved = row(t0, {
    s0: 68_000,
    s1: 67_999,
    outcome: "DOWN",
    result_committed_at: t0 + 301_000,
  });
  assert.deepEqual(getRoundPrices(resolved, 99_999, resolved.expire_at), {
    opening: 68_000,
    current: 67_999,
  });
  assert.equal(
    deriveBinaryPhase(
      row(t0, { result_committed_at: t0 + 301_000, outcome: null }),
      t0 + 302_000,
    ),
    "closed",
  );
});

test("price difference preserves sign, equality and missing values", () => {
  assert.deepEqual(getPriceDifference(67_320, 68_000), {
    amount: -680,
    percent: -1,
    isUp: false,
  });
  assert.deepEqual(getPriceDifference(68_680, 68_000), {
    amount: 680,
    percent: 1,
    isUp: true,
  });
  assert.deepEqual(getPriceDifference(68_000, 68_000), {
    amount: 0,
    percent: 0,
    isUp: true,
  });
  assert.equal(getPriceDifference(68_000), undefined);
  assert.equal(getPriceDifference(NaN, 68_000), undefined);
});

test("historical ticks keep real timestamps and never include T1 or later live ticks", () => {
  const history = [
    { timestamp: t0 + 1, price: 68_000 },
    { timestamp: t0 + 1, price: 68_001 },
    { timestamp: t0 + 299_999, price: 68_002 },
  ];
  const trailing = [
    { timestamp: t0 + 300_000, price: 68_003 },
    { timestamp: t0 + 400_000, price: 99_999 },
  ];
  assert.deepEqual(mergeIndexPoints(history, trailing, t0 + 300_000), [
    history[1],
    history[2],
  ]);
  const otherRound = [{ timestamp: t0 + 900_000, price: 70_000 }];
  assert.deepEqual(mergeIndexPoints(otherRound, trailing, t0 + 1_200_000), [
    ...trailing,
    ...otherRound,
  ]);
});

test("buy/sell quotes use their executable sides and probability uses the mid", () => {
  assert.deepEqual(getBinaryQuotes(0.55, 0.57), {
    executablePrices: {
      buy: { up: 0.57, down: 0.45 },
      sell: { up: 0.55, down: 0.43 },
    },
    upChance: 56,
  });
});

test("missing or invalid quote sides remain missing rather than defaulting to 50%", () => {
  assert.deepEqual(getBinaryQuotes(undefined, 0.57), {
    executablePrices: {
      buy: { up: 0.57, down: undefined },
      sell: { up: undefined, down: 0.43 },
    },
    upChance: undefined,
  });
  assert.equal(getBinaryQuotes().upChance, undefined);
  assert.equal(getBinaryQuotes(NaN, 1).executablePrices.buy.up, undefined);
});
