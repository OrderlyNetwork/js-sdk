import assert from "node:assert/strict";
import test from "node:test";
import type { API } from "@orderly.network/types";
import {
  normalizeBinaryHistory,
  summarizeBinaryHistory,
} from "./binaryHistory";
import { binaryHistoryCsv } from "./binaryHistoryCsv";
import { deriveBinaryPhase, type BinaryInfoDetail } from "./binaryInfo";
import { binaryResult } from "./binaryResult";
import {
  binaryDetailRefreshInterval,
  binaryHistoryDisplayRows,
  isBinarySettlementComplete,
  mergeBinaryDetail,
  pendingBinarySettlements,
  publishedBinaryOutcome,
} from "./binarySettlement";

const t0 = Date.UTC(2026, 9, 9, 12);
const symbol = "PERP_BTC5M2610091200_USDC";
const info: BinaryInfoDetail = {
  symbol,
  product_type: "BINARY",
  status: "DELISTING",
  activated_at: t0,
  observation_start_at: t0,
  expire_at: t0 + 300_000,
  s0: 68000.12,
  s1: 68000.12,
  outcome: "TIE",
  settlement_price_per_share: 0.5,
  result_committed_at: t0 + 301_000,
  index_price_symbol: "PERP_BTC_USDC",
  fee_model: "BINARY_PROBABILITY",
  price_evidence: {
    s0: { price: 68000.12, timestamp: t0, source: "live" },
    s1: { price: 68000.12, timestamp: t0 + 300_000, source: "live" },
  },
};
const history = (changes: Partial<API.PositionHistory> = {}) =>
  normalizeBinaryHistory({
    position_id: 1,
    symbol,
    side: "LONG",
    position_status: "closed",
    type: "trade",
    closed_position_qty: 100,
    avg_open_price: 0.4,
    avg_close_price: 0.5,
    realized_pnl: 10,
    trading_fee: 0.02,
    open_timestamp: t0,
    close_timestamp: t0 + 310_000,
    last_update_time: t0 + 310_000,
    outcome: "TIE",
    settlement_price_per_share: 0.5,
    settled_at: t0 + 310_000,
    ...changes,
  } as API.PositionHistory);

test("only exact UP/1, DOWN/0 and TIE/0.5 result pairs are accepted", () => {
  for (const [outcome, price, expected] of [
    ["UP", 1, "up"],
    ["DOWN", 0, "down"],
    ["TIE", 0.5, "tie"],
  ] as const) {
    assert.equal(binaryResult(outcome, price), expected);
    for (const other of [0, 0.5, 1, null, undefined, NaN, "0.5"])
      if (other !== price)
        assert.equal(binaryResult(outcome, other), undefined);
  }
  for (const outcome of [null, undefined, "VOID", "tie"])
    assert.equal(binaryResult(outcome, 0.5), undefined);
});

test("a committed tie resolves and stops detail polling only with complete evidence", () => {
  assert.equal(publishedBinaryOutcome(info), "tie");
  assert.equal(deriveBinaryPhase(info, t0 + 320_000), "resolvedTie");
  assert.equal(binaryDetailRefreshInterval(info), 0);
  assert.equal(
    binaryDetailRefreshInterval({ ...info, price_evidence: null }),
    5000,
  );
  for (const changes of [
    { result_committed_at: null },
    { s0: null },
    { s1: null },
    { s0: NaN },
    { s1: Infinity },
    { settlement_price_per_share: 1 },
  ]) {
    const row = { ...info, ...changes };
    assert.equal(publishedBinaryOutcome(row), undefined);
    assert.equal(deriveBinaryPhase(row, t0 + 320_000), "closed");
    assert.equal(binaryDetailRefreshInterval(row), 5000);
  }
  assert.equal(
    mergeBinaryDetail(info, { ...info, result_committed_at: null }),
    info,
  );
});

test("legacy committed UP/1 with equal boundary prices is never reinterpreted", () => {
  const legacy = {
    ...info,
    outcome: "UP" as const,
    settlement_price_per_share: 1,
  };
  assert.equal(publishedBinaryOutcome(legacy), "up");
  assert.equal(deriveBinaryPhase(legacy, t0 + 320_000), "resolvedUp");
});

test("tie history preserves both directions, cost, actual fees and completion without public metadata", () => {
  for (const side of ["LONG", "SHORT"] as const) {
    const short = side === "SHORT";
    const record = history({
      side,
      avg_open_price: short ? -0.4 : 0.4,
      avg_close_price: short ? -0.5 : 0.5,
      realized_pnl: short ? -10 : 10,
    });
    assert.equal(record.state, "settled");
    assert.equal(record.outcome, short ? "down" : "up");
    assert.equal(record.result, "tie");
    assert.equal(record.investment, short ? 60 : 40);
    assert.equal(record.settlementPrice, 0.5);
    assert.equal(record.payout, 50);
    assert.equal(record.pnl, short ? -10.02 : 9.98);
    assert.equal(record.completedAt, t0 + 310_000);
    assert.deepEqual(record.issues, []);
    assert.equal(isBinarySettlementComplete(record), true);
    const holding = {
      symbol,
      outcome: record.outcome!,
      quantity: 100,
      observedAt: t0,
    };
    assert.deepEqual(
      pendingBinarySettlements([record], [holding], t0 + 320_000),
      [],
    );
  }
  assert.equal(history({ avg_open_price: 0.8, realized_pnl: -30 }).pnl, -30.02);
});

test("published tie without personal completion stays pending and hides final amounts", () => {
  const record = history({ settled_at: null });
  assert.equal(record.state, "pending");
  assert.equal(record.result, "tie");
  assert.equal(record.pnl, undefined);
  assert.equal(record.payout, undefined);
  assert.equal(isBinarySettlementComplete(record), false);
  assert.deepEqual(pendingBinarySettlements([record], [], t0 + 320_000), [
    symbol,
  ]);
  const [display] = binaryHistoryDisplayRows([record]);
  assert.equal(display.settledAt, undefined);
});

test("mixed voluntary and expiry fills use whole-segment proceeds instead of R times total quantity", () => {
  for (const side of ["LONG", "SHORT"] as const) {
    const short = side === "SHORT";
    const record = history({
      side,
      avg_open_price: short ? -0.4 : 0.4,
      avg_close_price: short ? -0.6 : 0.6,
      realized_pnl: short ? -20 : 20,
    });
    assert.equal(record.settlementPrice, 0.5);
    assert.equal(record.payout, short ? 40 : 60);
    assert.equal(record.pnl, short ? -20.02 : 19.98);
    assert.deepEqual(record.issues, []);
  }
});

test("ordinary 0.5 exits and missing expiry results are not inferred to be ties", () => {
  const exit = history({
    outcome: null,
    settlement_price_per_share: null,
    settled_at: null,
    close_timestamp: t0 + 60_000,
  });
  assert.equal(exit.state, "exit");
  assert.equal(exit.result, "closed");
  const unknown = history({
    outcome: null,
    settlement_price_per_share: null,
    settled_at: null,
  });
  assert.equal(unknown.state, "unknown");
  assert.equal(unknown.result, undefined);
  assert.equal(
    publishedBinaryOutcome({
      ...info,
      outcome: null,
      result_committed_at: null,
    }),
    undefined,
  );
  assert.ok(
    history({ settlement_price_per_share: 1 }).issues.includes(
      "invalid_result",
    ),
  );
});

test("tie history participates in display, summary and CSV as a verified realized record", () => {
  const record = history();
  const [display] = binaryHistoryDisplayRows([record]);
  assert.equal(display.result, "tie");
  assert.equal(display.pnl, 9.98);
  const summary = summarizeBinaryHistory(
    [record],
    { from: t0, to: t0 + 3600_000 },
    "complete",
  );
  assert.equal(summary.completeness, "complete");
  assert.equal(summary.count, 1);
  assert.equal(summary.pnl, 9.98);
  const csv = binaryHistoryCsv([record], "complete", new Date(t0 + 3600_000));
  assert.equal(csv.success, true);
  if (csv.success) assert.ok(csv.csv.includes(",40,0.02,tie,0.5,50,9.98,"));
});
