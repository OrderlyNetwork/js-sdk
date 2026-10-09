import type {
  BinaryHistoryCompleteness,
  BinaryHistoryRecord,
} from "./binaryHistory";
import {
  binaryHistoryRange,
  summarizeBinaryHistory,
  uniqueBinaryHistory,
} from "./binaryHistory";

export type BinaryHistoryCsvResult =
  | { success: true; csv: string; count: number }
  | {
      success: false;
      reason: "incomplete_history" | "unknown_coverage" | "invalid_range";
    };
const HEADERS = [
  "symbol",
  "round",
  "direction",
  "quantity",
  "average_cost",
  "investment",
  "trading_fee",
  "result",
  "exit_or_settlement_price",
  "payout",
  "net_pnl",
  "completed_at",
];
export const binaryHistoryCsvCell = (value: string | number) => {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** Serialize only a verified complete 90-calendar-day realized dataset. */
export function binaryHistoryCsv(
  records: readonly BinaryHistoryRecord[],
  completeness: BinaryHistoryCompleteness,
  now = new Date(),
): BinaryHistoryCsvResult {
  let range;
  try {
    range = binaryHistoryRange(90, now);
  } catch {
    return { success: false, reason: "invalid_range" };
  }
  const summary = summarizeBinaryHistory(records, range, completeness);
  if (summary.completeness !== "complete")
    return {
      success: false,
      reason:
        summary.completeness === "unknown"
          ? "unknown_coverage"
          : "incomplete_history",
    };
  const rows = uniqueBinaryHistory(records)
    .records.filter(
      (record) =>
        record.completedAt != null &&
        record.completedAt >= range.from &&
        record.completedAt <= range.to &&
        (record.state === "exit" || record.state === "settled"),
    )
    .sort(
      (a, b) =>
        b.completedAt! - a.completedAt! ||
        a.recordKey.localeCompare(b.recordKey),
    );
  const values = rows.map((row) => [
    row.symbol,
    row.round,
    row.outcome!,
    row.quantity!,
    row.averagePrice!,
    row.investment!,
    row.tradingFee!,
    row.result!,
    row.settlementPrice!,
    row.payout!,
    row.pnl!,
    row.completedAt!,
  ]);
  return {
    success: true,
    count: rows.length,
    csv:
      "\uFEFF" +
      [HEADERS, ...values]
        .map((row) => row.map(binaryHistoryCsvCell).join(","))
        .join("\r\n") +
      "\r\n",
  };
}
