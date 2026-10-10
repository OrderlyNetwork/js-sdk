import assert from "node:assert/strict";
import test from "node:test";
import type { API } from "@orderly.network/types";
import {
  binaryHistoryCompleteness,
  binaryHistoryForAccount,
  binaryHistoryRange,
  binaryHistorySnapshot,
  binaryHistoryWindow,
  normalizeBinaryHistory,
  summarizeBinaryHistory,
  toPredictionSettlement,
  uniqueBinaryHistory,
} from "./binaryHistory";

const t0 = Date.UTC(2026, 9, 9, 12);
const row = (
  override: Partial<API.PositionHistory> = {},
): API.PositionHistory => ({
  position_id: 1,
  symbol: "PERP_BTC5M2610091200_USDC",
  position_status: "closed",
  type: "trade",
  side: "LONG",
  avg_open_price: 0.4,
  avg_close_price: 0.5,
  max_position_qty: 100,
  closed_position_qty: 100,
  trading_fee: 0.02,
  realized_pnl: 10,
  accumulated_funding_fee: 0,
  insurance_fund_fee: 0,
  liquidator_fee: 0,
  leverage: 1,
  open_timestamp: t0,
  close_timestamp: t0 + 120_000,
  last_update_time: t0 + 120_000,
  outcome: null,
  settlement_price_per_share: null,
  settled_at: null,
  ...override,
});
const range = { from: t0, to: t0 + 3600_000 };

test("Exit has actual fee, principal, payout and net once", () => {
  const r = normalizeBinaryHistory(row());
  assert.equal(r.state, "exit");
  assert.equal(r.investment, 40);
  assert.equal(r.payout, 50);
  assert.equal(r.pnl, 9.98);
  assert.equal(r.completedAt, t0 + 120_000);
  assert.deepEqual(r.issues, []);
  assert.equal(toPredictionSettlement(r).result, "closed");
});
test("SHORT signed and unsigned averages share the existing PERP normalization", () => {
  for (const sign of [-1, 1]) {
    const r = normalizeBinaryHistory(
      row({
        side: "SHORT",
        avg_open_price: sign * 0.5,
        avg_close_price: sign * 0.6,
        realized_pnl: -10,
        trading_fee: 0.00294,
      }),
    );
    assert.equal(r.averagePrice, 0.5);
    assert.equal(r.settlementPrice, 0.4);
    assert.equal(r.investment, 50);
    assert.equal(r.payout, 40);
    assert.equal(r.pnl, -10.00294);
    assert.deepEqual(r.issues, []);
  }
});
test("all four direction/result cases preserve zero payout and actual fee", () => {
  for (const side of ["LONG", "SHORT"] as const)
    for (const outcome of ["UP", "DOWN"] as const) {
      const rPrice = outcome === "UP" ? 1 : 0;
      const won = (side === "LONG") === (outcome === "UP");
      const r = normalizeBinaryHistory(
        row({
          side,
          avg_open_price: side === "LONG" ? 0.4 : -0.4,
          avg_close_price: side === "LONG" ? rPrice : -rPrice,
          outcome,
          settlement_price_per_share: rPrice,
          settled_at: t0 + 310_000,
          close_timestamp: t0 + 310_000,
          realized_pnl: (won ? 100 : 0) - (side === "LONG" ? 40 : 60),
        }),
      );
      assert.equal(r.state, "settled");
      assert.equal(r.payout, won ? 100 : 0);
      assert.equal(r.pnl, (won ? 100 : 0) - (side === "LONG" ? 40 : 60) - 0.02);
      assert.deepEqual(r.issues, []);
    }
});
test("observed SHORT R0 sample reconciles its 0.41 cost and net", () => {
  const r = normalizeBinaryHistory(
    row({
      side: "SHORT",
      avg_open_price: -0.59,
      avg_close_price: 0,
      closed_position_qty: 20,
      realized_pnl: 11.8,
      trading_fee: 0.002874,
      outcome: "DOWN",
      settlement_price_per_share: 0,
      close_timestamp: t0 + 310_000,
      settled_at: t0 + 310_000,
    }),
  );
  assert.equal(r.investment, 8.2);
  assert.equal(r.payout, 20);
  assert.equal(r.pnl, 11.797126);
  assert.deepEqual(r.issues, []);
});
test("partial voluntary exit followed by settlement uses whole-segment proceeds for every direction/result", () => {
  for (const side of ["LONG", "SHORT"] as const)
    for (const outcome of ["UP", "DOWN"] as const) {
      const rPrice = outcome === "UP" ? 1 : 0;
      const upClosePrice = rPrice === 1 ? 0.8 : 0.2;
      const investment = side === "LONG" ? 40 : 60;
      const payout = (side === "LONG") === (outcome === "UP") ? 80 : 20;
      const record = normalizeBinaryHistory(
        row({
          side,
          avg_open_price: side === "LONG" ? 0.4 : -0.4,
          avg_close_price: side === "LONG" ? upClosePrice : -upClosePrice,
          realized_pnl: payout - investment,
          outcome,
          settlement_price_per_share: rPrice,
          close_timestamp: t0 + 310_000,
          settled_at: t0 + 310_000,
        }),
      );
      assert.equal(record.state, "settled");
      assert.equal(record.settlementPrice, payout === 80 ? 1 : 0);
      assert.equal(record.investment, investment);
      assert.equal(record.payout, payout);
      assert.equal(
        toPredictionSettlement(record).pnl,
        payout - investment - 0.02,
      );
      assert.deepEqual(record.issues, []);
      const summary = summarizeBinaryHistory([record], range, "complete");
      assert.equal(summary.completeness, "complete");
      assert.equal(summary.count, 1);
      assert.equal(summary.pnl, payout - investment - 0.02);
    }
});
test("completed settlement with missing close average cannot invent segment proceeds", () => {
  const record = normalizeBinaryHistory(
    row({
      avg_close_price: undefined!,
      realized_pnl: 60,
      outcome: "UP",
      settlement_price_per_share: 1,
      close_timestamp: t0 + 310_000,
      settled_at: t0 + 310_000,
    }),
  );
  assert.equal(record.state, "settled");
  assert.equal(record.settlementPrice, 1);
  assert.equal(record.payout, undefined);
  assert.equal(toPredictionSettlement(record).pnl, undefined);
  assert.equal(
    summarizeBinaryHistory([record], range, "complete").completeness,
    "incomplete",
  );
});
test("public result is insufficient without segment completion", () => {
  const r = normalizeBinaryHistory(
    row({
      outcome: "UP",
      settlement_price_per_share: 1,
      close_timestamp: t0 + 310_000,
    }),
  );
  assert.equal(r.state, "pending");
  assert.equal(r.pnl, undefined);
  assert.equal(r.payout, undefined);
  assert.equal(r.completedAt, undefined);
  assert.ok(Number.isNaN(toPredictionSettlement(r).settlementPrice));
});
test("partial system close cannot expose final financial values", () => {
  const r = normalizeBinaryHistory(
    row({
      position_status: "partial_closed",
      outcome: "DOWN",
      settlement_price_per_share: 0,
    }),
  );
  assert.equal(r.state, "pending");
  assert.equal(r.pnl, undefined);
});
test("missing expiry fields after T1 do not invent an Exit", () => {
  const r = normalizeBinaryHistory(row({ close_timestamp: t0 + 310_000 }));
  assert.equal(r.state, "unknown");
  assert.equal(r.result, undefined);
  assert.equal(r.pnl, undefined);
  assert.equal(
    summarizeBinaryHistory([r], range, "complete").completeness,
    "incomplete",
  );
});
test("invalid R or inconsistent outcome with completion prevents complete export", () => {
  for (const price of [0, 0.5, NaN]) {
    const r = normalizeBinaryHistory(
      row({
        outcome: "UP",
        settlement_price_per_share: price,
        close_timestamp: t0 + 310_000,
        settled_at: t0 + 310_000,
      }),
    );
    assert.equal(r.state, "unknown");
    assert.equal(
      summarizeBinaryHistory([r], range, "complete").completeness,
      "incomplete",
    );
  }
});
test("missing actual fee does not become zero or realized profit", () => {
  const r = normalizeBinaryHistory(row({ trading_fee: undefined }));
  assert.equal(r.tradingFee, undefined);
  assert.equal(r.pnl, undefined);
  assert.equal(
    summarizeBinaryHistory([r], range, "complete").completeness,
    "incomplete",
  );
});
test("bad prices and non-reconciling amounts fail financial validity", () => {
  for (const override of [
    { avg_open_price: -0.4 },
    { avg_close_price: 1.1 },
    { realized_pnl: 99 },
  ]) {
    const r = normalizeBinaryHistory(row(override));
    assert.ok(r.issues.length > 0);
    assert.equal(
      summarizeBinaryHistory([r], range, "complete").completeness,
      "incomplete",
    );
  }
});
test("same round reopening retains separate segments and avoids duplicate sums", () => {
  const first = normalizeBinaryHistory(row());
  const second = normalizeBinaryHistory(
    row({
      position_id: 2,
      open_timestamp: t0 + 150_000,
      closed_position_qty: 60,
      avg_open_price: 0.3,
      avg_close_price: 1,
      realized_pnl: 42,
      outcome: "UP",
      settlement_price_per_share: 1,
      close_timestamp: t0 + 310_000,
      settled_at: t0 + 310_000,
    }),
  );
  const sum = summarizeBinaryHistory([first, first, second], range, "complete");
  assert.equal(sum.count, 2);
  assert.equal(sum.pnl, 51.96);
  assert.equal(sum.investment, 58);
});
test("server revision replaces a segment and conflicting equal revisions fail", () => {
  const old = normalizeBinaryHistory(row());
  const fresh = normalizeBinaryHistory(
    row({ trading_fee: 0.03, last_update_time: t0 + 130_000 }),
  );
  assert.equal(uniqueBinaryHistory([fresh, old]).records[0].tradingFee, 0.03);
  assert.equal(
    summarizeBinaryHistory(
      [old, normalizeBinaryHistory(row({ trading_fee: 0.03 }))],
      range,
      "complete",
    ).completeness,
    "incomplete",
  );
});
const permutations = <T>(values: readonly T[]): T[][] =>
  values.length === 0
    ? [[]]
    : values.flatMap((value, index) =>
        permutations(values.filter((_, i) => i !== index)).map((rest) => [
          value,
          ...rest,
        ]),
      );
test("a newer revision supersedes conflicting older revisions in every input order", () => {
  const oldA = normalizeBinaryHistory(row());
  const oldB = normalizeBinaryHistory(row({ trading_fee: 0.03 }));
  const latest = normalizeBinaryHistory(
    row({ trading_fee: 0.04, last_update_time: t0 + 130_000 }),
  );
  for (const records of permutations([oldA, oldB, latest])) {
    const unique = uniqueBinaryHistory(records);
    assert.equal(unique.conflict, false);
    assert.deepEqual(unique.records, [latest]);
    const summary = summarizeBinaryHistory(records, range, "complete");
    assert.equal(summary.completeness, "complete");
    assert.equal(summary.count, 1);
    assert.equal(summary.pnl, 9.96);
  }
});
test("conflicting latest or unversioned records remain incomplete in every input order", () => {
  const old = normalizeBinaryHistory(row());
  const latest = normalizeBinaryHistory(
    row({ trading_fee: 0.04, last_update_time: t0 + 130_000 }),
  );
  for (const last_update_time of [t0 + 130_000, undefined]) {
    const conflicting = normalizeBinaryHistory(
      row({ trading_fee: 0.05, last_update_time }),
    );
    for (const records of permutations([old, latest, conflicting])) {
      assert.equal(uniqueBinaryHistory(records).conflict, true);
      assert.equal(
        summarizeBinaryHistory(records, range, "complete").completeness,
        "incomplete",
      );
    }
  }
});
test("weekly investment 60 and net 5.98 use actual fees", () => {
  const records = [
    normalizeBinaryHistory(row({ trading_fee: 0.01 })),
    normalizeBinaryHistory(
      row({
        position_id: 2,
        closed_position_qty: 100,
        avg_open_price: 0.2,
        avg_close_price: 0.16,
        realized_pnl: -4,
        trading_fee: 0.01,
      }),
    ),
  ];
  const sum = summarizeBinaryHistory(records, range, "complete");
  assert.equal(sum.investment, 60);
  assert.equal(sum.tradingFee, 0.02);
  assert.equal(sum.pnl, 5.98);
});
test("coverage needs verified evidence even below or at the requested limit", () => {
  for (const rowCount of [0, 20, 1000])
    assert.equal(
      binaryHistoryCompleteness({ loaded: true, rowCount, limit: 1000 }),
      "unknown",
    );
  assert.equal(
    binaryHistoryCompleteness({
      loaded: true,
      rowCount: 20,
      limit: 1000,
      coverageVerified: true,
    }),
    "complete",
  );
  assert.equal(
    binaryHistoryCompleteness({
      loaded: true,
      rowCount: 1000,
      limit: 1000,
      truncated: true,
    }),
    "incomplete",
  );
  assert.equal(
    binaryHistoryCompleteness({
      loaded: false,
      rowCount: 0,
      limit: 1000,
      failed: true,
    }),
    "incomplete",
  );
  assert.equal(summarizeBinaryHistory([], range, "unknown").pnl, undefined);
});
test("calendar boundaries use local dates, Monday and an explicit snapshot time", () => {
  const now = new Date(2026, 9, 9, 14, 30);
  const r = binaryHistoryRange(90, now);
  const start = new Date(now);
  start.setDate(start.getDate() - 89);
  start.setHours(0, 0, 0, 0);
  assert.equal(r.from, start.getTime());
  assert.equal(r.to, now.getTime());
  assert.throws(() => binaryHistoryRange(91, now), RangeError);
  assert.throws(() => binaryHistoryRange(90, new Date(NaN)), RangeError);
});
test("strict symbol dates preserve metadata-independent 5/10/15M windows", () => {
  assert.equal(
    binaryHistoryWindow("PERP_BTC15M2610091200_USDC")!.to,
    t0 + 900_000,
  );
  assert.equal(binaryHistoryWindow("PERP_BTC5M2602301200_USDC"), undefined);
  assert.equal(normalizeBinaryHistory(row()).round, t0 / 1000);
});
test("tagged data excludes late responses across account switches, logout and inactivity", () => {
  const a = binaryHistorySnapshot("A", { rows: [row()] }, t0);
  const b = binaryHistorySnapshot("B", { rows: [] }, t0 + 1);
  assert.equal(binaryHistoryForAccount(a, "B", true), undefined);
  assert.equal(binaryHistoryForAccount(b, "B", true), b);
  assert.equal(binaryHistoryForAccount(a, undefined, false), undefined);
  assert.equal(binaryHistoryForAccount(b, "B", false), undefined);
  assert.equal(binaryHistorySnapshot("A", { rows: null }).rows, undefined);
  assert.deepEqual(binaryHistorySnapshot("A", { rows: [] }).rows, []);
});

test("unknown status and forced-close type are not treated as voluntary Exit", () => {
  for (const override of [
    { position_status: undefined },
    { type: "liquidated" },
    { type: "close" },
  ]) {
    const record = normalizeBinaryHistory(row(override));
    assert.equal(record.state, "unknown");
    assert.equal(
      summarizeBinaryHistory([record], range, "complete").completeness,
      "incomplete",
    );
  }
});
test("malformed rows response never reaches the row mapper", () => {
  assert.equal(binaryHistorySnapshot("A", { rows: [null] }).rows, undefined);
  assert.equal(binaryHistorySnapshot("A", { rows: [42] }).rows, undefined);
});
test("duplicate field order or irrelevant raw metadata does not create a financial conflict", () => {
  const first = normalizeBinaryHistory(row());
  const second = normalizeBinaryHistory(row({ leverage: 2 }));
  assert.equal(uniqueBinaryHistory([first, second]).conflict, false);
});

test("identical duplicated segments need no revision timestamp to deduplicate safely", () => {
  const record = normalizeBinaryHistory(row({ last_update_time: undefined }));
  const summary = summarizeBinaryHistory([record, record], range, "complete");
  assert.equal(summary.completeness, "complete");
  assert.equal(summary.count, 1);
  assert.equal(summary.pnl, 9.98);
});
