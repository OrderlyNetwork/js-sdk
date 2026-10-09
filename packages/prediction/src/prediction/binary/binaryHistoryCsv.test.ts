import assert from "node:assert/strict";
import test from "node:test";
import type { API } from "@orderly.network/types";
import { binaryHistoryRange, normalizeBinaryHistory } from "./binaryHistory";
import { binaryHistoryCsv, binaryHistoryCsvCell } from "./binaryHistoryCsv";

const now = new Date(2026, 9, 9, 23, 59);
function record(id: number, date: Date, settled = false) {
  const t0 = date.getTime();
  const part = `${String(date.getUTCFullYear()).slice(-2)}${String(date.getUTCMonth() + 1).padStart(2, "0")}${String(date.getUTCDate()).padStart(2, "0")}${String(date.getUTCHours()).padStart(2, "0")}${String(date.getUTCMinutes()).padStart(2, "0")}`;
  return normalizeBinaryHistory({
    position_id: id,
    symbol: `PERP_BTC5M${part}_USDC`,
    side: "LONG",
    position_status: "closed",
    type: "trade",
    closed_position_qty: 100,
    avg_open_price: 0.4,
    avg_close_price: settled ? 0 : 0.5,
    trading_fee: 0.0001,
    realized_pnl: settled ? -40 : 10,
    open_timestamp: t0,
    close_timestamp: t0 + (settled ? 310_000 : 60_000),
    last_update_time: t0 + 310_000,
    outcome: settled ? "DOWN" : null,
    settlement_price_per_share: settled ? 0 : null,
    settled_at: settled ? t0 + 310_000 : null,
  } as API.PositionHistory);
}
test("90-day CSV includes every realized segment beyond one page, not old or pending data", () => {
  const records = Array.from({ length: 45 }, (_, i) =>
    record(i + 1, new Date(2026, 9, 9, 12, 0), i % 2 === 0),
  );
  const boundary = new Date(binaryHistoryRange(90, now).from);
  records.push(record(100, boundary));
  records.push(record(101, new Date(boundary.getTime() - 86400_000)));
  const pending = record(102, new Date(2026, 9, 9, 12), true);
  records.push(normalizeBinaryHistory({ ...pending.source, settled_at: null }));
  const result = binaryHistoryCsv([...records, records[0]], "complete", now);
  assert.equal(result.success, true);
  if (!result.success) return;
  assert.equal(result.count, 46);
  assert.equal(result.csv.split("\r\n").length, 48);
  assert.ok(result.csv.startsWith("\uFEFFsymbol,round,direction"));
  assert.ok(result.csv.includes(",0,-40.0001,"));
  assert.ok(result.csv.includes(",40,0.0001,down,0,0,-40.0001,"));
});
test("unknown, truncated and malformed realized history cannot produce complete CSV", () => {
  const valid = record(1, new Date(2026, 9, 9, 12));
  assert.deepEqual(binaryHistoryCsv([valid], "unknown", now), {
    success: false,
    reason: "unknown_coverage",
  });
  assert.deepEqual(binaryHistoryCsv([valid], "incomplete", now), {
    success: false,
    reason: "incomplete_history",
  });
  assert.equal(
    binaryHistoryCsv(
      [normalizeBinaryHistory({ ...valid.source, trading_fee: undefined })],
      "complete",
      now,
    ).success,
    false,
  );
  assert.deepEqual(binaryHistoryCsv([], "complete", new Date(NaN)), {
    success: false,
    reason: "invalid_range",
  });
});
test("verified empty history is a valid header-only export", () => {
  const result = binaryHistoryCsv([], "complete", now);
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.count, 0);
});
test("CSV exports mixed voluntary/expiry proceeds and latest revision independently of input order", () => {
  const source = record(1, new Date(2026, 9, 9, 12), true).source;
  const mixed = normalizeBinaryHistory({
    ...source,
    avg_close_price: 0.8,
    realized_pnl: 40,
    trading_fee: 0.02,
    outcome: "UP",
    settlement_price_per_share: 1,
  });
  const oldA = normalizeBinaryHistory({
    ...mixed.source,
    trading_fee: 0.03,
    last_update_time: source.last_update_time - 1,
  });
  const oldB = normalizeBinaryHistory({ ...oldA.source, trading_fee: 0.04 });
  const result = binaryHistoryCsv([oldA, oldB, mixed], "complete", now);
  assert.equal(result.success, true);
  if (!result.success) return;
  assert.equal(result.count, 1);
  assert.ok(result.csv.includes(",40,0.02,up,1,80,39.98,"));
  assert.deepEqual(
    binaryHistoryCsv([mixed, oldB, oldA], "complete", now),
    result,
  );
});
test("CSV cells escape commas, quotes and newlines while retaining zero and negative numbers", () => {
  assert.equal(binaryHistoryCsvCell('x,"y"\nz'), '"x,""y""\nz"');
  assert.equal(binaryHistoryCsvCell(0), "0");
  assert.equal(binaryHistoryCsvCell(-0.001), "-0.001");
});
