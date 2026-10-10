import assert from "node:assert/strict";
import test from "node:test";
import type { API } from "@orderly.network/types";
import { normalizeBinaryHistory } from "./binaryHistory";
import type { BinaryInfoDetail } from "./binaryInfo";
import {
  binaryDetailRefreshInterval,
  binaryHistoryDisplayRows,
  binaryHistoryFilterTime,
  binaryPersonalSettlementStatus,
  binaryRoundPersonalRecords,
  binarySettlementRefreshInterval,
  hasBinaryPriceEvidence,
  isBinarySettlementComplete,
  mergeBinaryDetail,
  nextTradableBinaryRound,
  observeBinarySettlementHoldings,
  pendingBinarySettlements,
  publishedBinaryOutcome,
  updateBinarySettlementWatch,
} from "./binarySettlement";

const t0 = Date.UTC(2026, 9, 9, 12);
const symbol = "PERP_BTC5M2610091200_USDC";
const info = (overrides: Partial<BinaryInfoDetail> = {}): BinaryInfoDetail =>
  ({
    symbol,
    status: "DELISTING",
    observation_start_at: t0,
    expire_at: t0 + 300_000,
    index_price_symbol: "PERP_BTC_USDC",
    s0: 100,
    s1: 101,
    outcome: "UP",
    result_committed_at: t0 + 301_000,
    settlement_price_per_share: 1,
    ...overrides,
  }) as BinaryInfoDetail;
const history = (overrides: Partial<API.PositionHistory> = {}) =>
  normalizeBinaryHistory({
    position_id: 1,
    symbol,
    side: "LONG",
    position_status: "closed",
    type: "trade",
    closed_position_qty: 100,
    avg_open_price: 0.4,
    avg_close_price: 1,
    realized_pnl: 60,
    trading_fee: 0.02,
    open_timestamp: t0,
    close_timestamp: t0 + 310_000,
    last_update_time: t0 + 310_000,
    outcome: "UP",
    settlement_price_per_share: 1,
    settled_at: t0 + 310_000,
    ...overrides,
  } as API.PositionHistory);
const holding = {
  symbol,
  outcome: "up" as const,
  quantity: 100,
  observedAt: t0 + 200_000,
};

test("public outcome requires committed official values and matching R, not position direction", () => {
  assert.equal(publishedBinaryOutcome(info()), "up");
  assert.equal(
    publishedBinaryOutcome(
      info({ outcome: "DOWN", settlement_price_per_share: 0 }),
    ),
    "down",
  );
  for (const bad of [
    { result_committed_at: null },
    { s1: null },
    { s0: NaN },
    { settlement_price_per_share: 0 },
    { outcome: null },
  ])
    assert.equal(publishedBinaryOutcome(info(bad)), undefined);
  assert.equal(
    isBinarySettlementComplete(history({ settled_at: null })),
    false,
  );
});
test("detail evidence is validated against official prices and boundary timestamps", () => {
  const row = info({
    price_evidence: {
      s0: { price: 100, timestamp: t0, source: "live" },
      s1: { price: 101, timestamp: t0 + 300_000, source: "live" },
    },
  });
  assert.equal(hasBinaryPriceEvidence(row), true);
  assert.equal(binaryDetailRefreshInterval(row), 0);
  assert.equal(binaryDetailRefreshInterval(info()), 5000);
  assert.equal(binaryDetailRefreshInterval(undefined), 5000);
  assert.equal(binaryDetailRefreshInterval({ ...row, s1: 102 }), 5000);
  assert.equal(hasBinaryPriceEvidence(info()), false);
  assert.equal(hasBinaryPriceEvidence({ ...row, s1: 102 }), false);
  assert.equal(
    hasBinaryPriceEvidence({ ...row, expire_at: t0 + 301_000 }),
    false,
  );
  assert.equal(
    mergeBinaryDetail(row, info({ result_committed_at: null, s1: null })),
    row,
  );
  assert.equal(mergeBinaryDetail(row, info({ symbol: "other" })), row);
  assert.equal(
    mergeBinaryDetail(info(), row)?.price_evidence,
    row.price_evidence,
  );
  assert.equal(mergeBinaryDetail(row, undefined), row);
});
test("public result does not complete personal funds; pending and incomplete amounts remain missing", () => {
  const pending = history({ settled_at: null });
  assert.equal(
    binaryPersonalSettlementStatus([pending], false, false),
    "processing",
  );
  assert.equal(isBinarySettlementComplete(pending), false);
  assert.equal(binaryPersonalSettlementStatus([], false, true), "processing");
  assert.equal(binaryPersonalSettlementStatus([], false, false), undefined);
  const missing = history({ trading_fee: NaN });
  assert.equal(
    binaryPersonalSettlementStatus([missing], false, false),
    "incomplete",
  );
  assert.equal(isBinarySettlementComplete(missing), false);
  assert.equal(isBinarySettlementComplete(history()), true);
  assert.equal(isBinarySettlementComplete(history(), true), false);
});
test("result consumer preserves four outcome PnLs, zero fee, negative PnL and SHORT conventions", () => {
  for (const side of ["LONG", "SHORT"] as const)
    for (const outcome of ["UP", "DOWN"] as const) {
      const r = outcome === "UP" ? 1 : 0;
      const won = (side === "LONG") === (outcome === "UP");
      for (const sign of side === "SHORT" ? [-1, 1] : [1]) {
        const record = history({
          side,
          outcome,
          settlement_price_per_share: r,
          avg_open_price: sign * 0.4,
          avg_close_price: sign * r,
          trading_fee: 0,
          realized_pnl: (won ? 100 : 0) - (side === "LONG" ? 40 : 60),
        });
        const personal = binaryRoundPersonalRecords([record], symbol);
        assert.equal(
          isBinarySettlementComplete(
            personal.expiryRecords[0],
            personal.conflict,
          ),
          true,
        );
        assert.equal(
          personal.expiryRecords[0].pnl,
          (won ? 100 : 0) - (side === "LONG" ? 40 : 60),
        );
        assert.equal(personal.expiryRecords[0].tradingFee, 0);
        assert.equal(personal.expiryRecords[0].payout, won ? 100 : 0);
      }
    }
});
test("pending history filters by symbol T1 beyond public snapshot without fabricating completion or winner", () => {
  const record = history({
    outcome: null,
    settlement_price_per_share: null,
    settled_at: null,
  });
  assert.equal(binaryHistoryFilterTime(record), t0 + 300_000);
  const display = binaryHistoryDisplayRows([record])[0];
  assert.equal(display.filterTime, t0 + 300_000);
  assert.equal(display.settledAt, undefined);
  assert.equal(display.result, undefined);
  assert.equal(display.pnl, undefined);
  assert.equal(binaryHistoryFilterTime(history()), t0 + 310_000);
  const malformed = history({ symbol: "bad" });
  assert.equal(binaryHistoryFilterTime(malformed), t0 + 310_000);
});
test("same position id with separate openings stays distinct, duplicate/conflicting segments are handled", () => {
  const exit = history({
    avg_close_price: 0.5,
    realized_pnl: 10,
    close_timestamp: t0 + 100_000,
    last_update_time: t0 + 100_000,
    outcome: null,
    settlement_price_per_share: null,
    settled_at: null,
  });
  const reentry = history({ open_timestamp: t0 + 150_000 });
  const rows = binaryHistoryDisplayRows([exit, reentry, reentry]);
  assert.equal(rows.length, 2);
  assert.notEqual(rows[0].recordKey, rows[1].recordKey);
  const personal = binaryRoundPersonalRecords([exit, reentry], symbol);
  assert.equal(personal.expiryRecords.length, 1);
  assert.equal(personal.expiryRecords[0].pnl, 59.98);
  assert.equal(
    binaryHistoryDisplayRows([reentry, { ...reentry, pnl: 123 }])[0].pnl,
    undefined,
  );
});
test("expired held round remains watched after positions disappear or user switches to next round", () => {
  const positions = [
    { symbol, quantity: 100, outcome: "up" as const, averagePrice: 0.4 },
  ];
  const observed = observeBinarySettlementHoldings([], positions, t0 + 200_000);
  assert.deepEqual(
    observeBinarySettlementHoldings(observed, positions, t0 + 210_000),
    observed,
  );
  assert.deepEqual(
    observeBinarySettlementHoldings(observed, [], t0 + 300_000),
    observed,
  );
  assert.deepEqual(pendingBinarySettlements([], observed, t0 + 299_000), []);
  assert.deepEqual(pendingBinarySettlements([], observed, t0 + 300_000), [
    symbol,
  ]);
  assert.deepEqual(
    pendingBinarySettlements([history()], observed, t0 + 320_000),
    [],
  );
  assert.deepEqual(
    observeBinarySettlementHoldings(observed, [], t0 + 250_000),
    [],
  );
});
test("partial Exit cannot complete remaining settlement and an older Exit cannot cover a reentry", () => {
  const exit = history({
    closed_position_qty: 60,
    avg_close_price: 0.5,
    realized_pnl: 6,
    close_timestamp: t0 + 250_000,
    last_update_time: t0 + 250_000,
    outcome: null,
    settlement_price_per_share: null,
    settled_at: null,
  });
  const remaining = history({ avg_close_price: 0.7, realized_pnl: 30 });
  assert.deepEqual(pendingBinarySettlements([exit], [holding], t0 + 320_000), [
    symbol,
  ]);
  assert.deepEqual(
    pendingBinarySettlements([exit, remaining], [holding], t0 + 320_000),
    [],
  );
  assert.deepEqual(
    pendingBinarySettlements(
      [exit],
      [{ ...holding, quantity: 60, observedAt: t0 + 260_000 }],
      t0 + 320_000,
    ),
    [symbol],
  );
});

for (const outcome of ["up", "down"] as const) {
  test(`equal-quantity reversal to ${outcome} ignores the previous direction's closes`, () => {
    const previousOutcome = outcome === "up" ? "down" : "up";
    const observed = observeBinarySettlementHoldings(
      [],
      [{ symbol, outcome: previousOutcome, quantity: 100 }],
      t0 + 100_000,
    );
    const reversed = observeBinarySettlementHoldings(
      observed,
      [{ symbol, outcome, quantity: 100 }],
      t0 + 200_000,
    );
    assert.equal(reversed[0].outcome, outcome);
    assert.equal(reversed[0].observedAt, t0 + 200_000);

    const oldExit = history({
      side: previousOutcome === "up" ? "LONG" : "SHORT",
      avg_close_price: 0.5,
      realized_pnl: previousOutcome === "up" ? 10 : -10,
      close_timestamp: t0 + 150_000,
      last_update_time: t0 + 150_000,
      outcome: null,
      settlement_price_per_share: null,
      settled_at: null,
    });
    assert.deepEqual(oldExit.issues, []);
    assert.deepEqual(
      pendingBinarySettlements([oldExit], reversed, t0 + 320_000),
      [symbol],
    );
    // Even a delayed close after the observation belongs to the old direction.
    assert.deepEqual(
      pendingBinarySettlements(
        [{ ...oldExit, completedAt: t0 + 250_000 }],
        reversed,
        t0 + 320_000,
      ),
      [symbol],
    );
    const oldSettlement = history({
      side: previousOutcome === "up" ? "LONG" : "SHORT",
      realized_pnl: previousOutcome === "up" ? 60 : -60,
    });
    assert.deepEqual(oldSettlement.issues, []);
    assert.deepEqual(
      pendingBinarySettlements([oldSettlement], reversed, t0 + 320_000),
      [symbol],
    );
    const newSettlement = history({
      position_id: 2,
      side: outcome === "up" ? "LONG" : "SHORT",
      open_timestamp: t0 + 200_000,
      realized_pnl: outcome === "up" ? 60 : -60,
    });
    assert.deepEqual(newSettlement.issues, []);
    assert.deepEqual(
      pendingBinarySettlements(
        [oldExit, newSettlement],
        reversed,
        t0 + 320_000,
      ),
      [],
    );
  });
}

test("late reversal updates direction while same-direction expiry reductions retain the watched quantity", () => {
  const observed = observeBinarySettlementHoldings(
    [],
    [{ symbol, outcome: "up", quantity: 100 }],
    t0 + 200_000,
  );
  assert.deepEqual(
    observeBinarySettlementHoldings(
      observed,
      [{ symbol, outcome: "up", quantity: 40 }],
      t0 + 310_000,
    ),
    observed,
  );
  const reversed = observeBinarySettlementHoldings(
    observed,
    [{ symbol, outcome: "down", quantity: 100 }],
    t0 + 310_000,
  );
  assert.equal(reversed[0].outcome, "down");
  assert.equal(reversed[0].observedAt, t0 + 310_000);
  assert.deepEqual(
    pendingBinarySettlements([history()], reversed, t0 + 320_000),
    [symbol],
  );
});

test("personal history interval is fast only for active pending settlements", () => {
  assert.equal(binarySettlementRefreshInterval(true, [symbol]), 5000);
  assert.equal(binarySettlementRefreshInterval(true, []), 60000);
  assert.equal(binarySettlementRefreshInterval(false, [symbol]), 0);
});
test("next round uses earliest ACTIVE unexpired candidate, including pre-T0; expires on click recheck", () => {
  const future = info({
    symbol: "future",
    status: "ACTIVE",
    observation_start_at: t0 + 600_000,
    expire_at: t0 + 900_000,
  });
  const nearest = info({
    symbol: "nearest",
    status: "ACTIVE",
    expire_at: t0 + 600_000,
  });
  assert.equal(
    nextTradableBinaryRound([future, info(), nearest], t0 + 300_000),
    nearest,
  );
  assert.equal(
    nextTradableBinaryRound([future, nearest], t0 + 600_000),
    future,
  );
  assert.equal(
    nextTradableBinaryRound([future, nearest], t0 + 900_000),
    undefined,
  );
});

test("account switch clears old watches while awaiting current private response; logout clears them too", () => {
  const positions = [{ symbol, quantity: 100, outcome: "up" as const }];
  const old = updateBinarySettlementWatch(
    { holdings: [], initialized: false },
    {
      accountId: "old",
      active: true,
      positions,
      seedPositions: positions,
      now: t0 + 200_000,
    },
  );
  const switched = updateBinarySettlementWatch(old, {
    accountId: "new",
    active: true,
    positions,
    now: t0 + 320_000,
  });
  assert.deepEqual(switched.holdings, []);
  assert.equal(switched.initialized, false);
  const ready = updateBinarySettlementWatch(switched, {
    accountId: "new",
    active: true,
    positions,
    seedPositions: [],
    now: t0 + 320_000,
  });
  assert.deepEqual(ready.holdings, []);
  const logout = updateBinarySettlementWatch(old, {
    active: true,
    positions,
    now: t0 + 320_000,
  });
  assert.deepEqual(logout.holdings, []);
  assert.equal(logout.initialized, false);
});
test("inactive watch pauses observations; unchanged snapshots keep stable observation time", () => {
  const positions = [{ symbol, quantity: 100, outcome: "up" as const }];
  const watch = updateBinarySettlementWatch(
    { holdings: [], initialized: false },
    {
      accountId: "a",
      active: true,
      positions,
      seedPositions: positions,
      now: t0 + 200_000,
    },
  );
  assert.equal(
    updateBinarySettlementWatch(watch, {
      accountId: "a",
      active: true,
      positions,
      now: t0 + 210_000,
    }),
    watch,
  );
  assert.equal(
    updateBinarySettlementWatch(watch, {
      accountId: "a",
      active: false,
      positions: [],
      now: t0 + 320_000,
    }),
    watch,
  );
  const active = updateBinarySettlementWatch(watch, {
    accountId: "a",
    active: true,
    positions: [],
    now: t0 + 320_000,
  });
  assert.deepEqual(
    pendingBinarySettlements([], active.holdings, t0 + 320_000),
    [symbol],
  );
});

test("conflicting revisions do not hide another verified position segment", () => {
  const valid = history({ position_id: 2 });
  const conflicted = history();
  const rows = binaryHistoryDisplayRows([
    valid,
    conflicted,
    { ...conflicted, pnl: 123 },
  ]);
  assert.equal(rows.find((r) => r.recordKey === valid.recordKey)?.pnl, 59.98);
  assert.equal(
    rows.find((r) => r.recordKey === conflicted.recordKey)?.pnl,
    undefined,
  );
  assert.deepEqual(
    pendingBinarySettlements(
      [valid, conflicted, { ...conflicted, pnl: 123 }],
      [],
      t0 + 320_000,
    ),
    [symbol],
  );
});

test("merging identical details retains the cached row reference", () => {
  const row = {
    symbol: "PERP_BTC5M2608271200_USDC",
    s0: 100,
  } as BinaryInfoDetail;
  const detail = { ...row, s1: 101 };
  const merged = mergeBinaryDetail(row, detail)!;
  assert.equal(mergeBinaryDetail(merged, detail), merged);
});
