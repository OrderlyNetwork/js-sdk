import type { API } from "@orderly.network/types";
import { Decimal, parseBinarySymbol } from "@orderly.network/utils";
import type {
  PredictionOutcome,
  PredictionResult,
  PredictionSettlement,
} from "../prediction.types";
import { binaryRoundFromSymbol } from "./binaryInfo";
import { complementPrice } from "./binaryOrderRules";
import { binaryResult } from "./binaryResult";

export type BinaryHistoryState = "exit" | "settled" | "pending" | "unknown";
export type BinaryHistoryCompleteness = "complete" | "incomplete" | "unknown";
export type BinaryHistoryRange = { from: number; to: number };
export type BinaryHistoryRecord = {
  recordKey: string;
  source: Readonly<API.PositionHistory>;
  state: BinaryHistoryState;
  symbol: string;
  round: number;
  outcome?: PredictionOutcome;
  result?: PredictionResult | "closed";
  quantity?: number;
  averagePrice?: number;
  investment?: number;
  tradingFee?: number;
  settlementPrice?: number;
  payout?: number;
  pnl?: number;
  openedAt?: number;
  completedAt?: number;
  issues: string[];
};

export const finiteBinaryNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);
const timestamp = (value: unknown): value is number =>
  finiteBinaryNumber(value) && Number.isSafeInteger(value) && value > 0;
const unsignedPrice = (value: unknown, short: boolean) => {
  if (!finiteBinaryNumber(value) || (!short && value < 0)) return undefined;
  const price = short ? Math.abs(value) : value;
  return price >= 0 && price <= 1 ? price : undefined;
};

/**
 * Strict UTC symbol parsing also works after public metadata expires.
 * Memoized per symbol: settlement/history hot paths re-parse every record.
 * Every round mints a new symbol, so the cache is FIFO-bounded to keep a long
 * session from growing it without limit; entries are immutable per symbol.
 */
export const BINARY_HISTORY_WINDOW_CACHE_LIMIT = 2_000;
const binaryHistoryWindowCache = new Map<
  string,
  { from: number; to: number } | undefined
>();
export function binaryHistoryWindow(symbol: string) {
  if (binaryHistoryWindowCache.has(symbol))
    return binaryHistoryWindowCache.get(symbol);
  const parsed = parseBinarySymbol(symbol);
  const window = parsed
    ? {
        from: parsed.roundStartMs,
        to: new Decimal(parsed.roundStartMs)
          .add(new Decimal(parsed.intervalSeconds).mul(1000))
          .toNumber(),
      }
    : undefined;
  if (binaryHistoryWindowCache.size >= BINARY_HISTORY_WINDOW_CACHE_LIMIT) {
    const oldest = binaryHistoryWindowCache.keys().next().value;
    if (oldest !== undefined) binaryHistoryWindowCache.delete(oldest);
  }
  binaryHistoryWindowCache.set(symbol, window);
  return window;
}

/** Test-only probe: current number of cached symbol windows. */
export const binaryHistoryWindowCacheSize = () => binaryHistoryWindowCache.size;

/** Normalize the existing signed SHORT average-price convention, then mirror DOWN. */
export function normalizeBinaryHistory(
  row: API.PositionHistory,
): BinaryHistoryRecord {
  const short = row.side === "SHORT";
  const direction = row.side === "LONG" ? "up" : short ? "down" : undefined;
  const entry = unsignedPrice(row.avg_open_price, short);
  const exit = unsignedPrice(row.avg_close_price, short);
  const ownPrice = (price: number | undefined) =>
    price == null ? undefined : short ? complementPrice(price) : price;
  const quantity = finiteBinaryNumber(row.closed_position_qty)
    ? Math.abs(row.closed_position_qty)
    : undefined;
  const outcome = binaryResult(row.outcome, row.settlement_price_per_share);
  const matchingResult = outcome != null;
  const status =
    typeof row.position_status === "string"
      ? row.position_status.toLowerCase()
      : "";
  const closed = status === "closed";
  const ordinaryTrade =
    typeof row.type === "string" &&
    ["trade", "transaction"].includes(row.type.toLowerCase());
  const window = binaryHistoryWindow(row.symbol);
  const hasExpiryEvidence =
    row.outcome != null ||
    row.settlement_price_per_share != null ||
    row.settled_at != null;
  const chronological =
    timestamp(row.open_timestamp) &&
    timestamp(row.close_timestamp) &&
    row.close_timestamp >= row.open_timestamp;
  let state: BinaryHistoryState = "unknown";
  if (!closed)
    state = ["open", "opened", "partial_closed"].includes(status)
      ? "pending"
      : "unknown";
  else if (hasExpiryEvidence) {
    state =
      matchingResult &&
      chronological &&
      timestamp(row.settled_at) &&
      row.settled_at >= row.open_timestamp &&
      window != null &&
      row.settled_at >= window.to
        ? "settled"
        : row.settled_at != null
          ? "unknown"
          : "pending";
  } else if (
    ordinaryTrade &&
    chronological &&
    window &&
    row.close_timestamp < window.to
  )
    state = "exit";
  // A post-expiry row with missing result fields cannot prove voluntary exit.
  const completed = state === "exit" || state === "settled";
  const settlementPrice = completed
    ? ownPrice(state === "settled" ? row.settlement_price_per_share! : exit)
    : undefined;
  // The close average covers voluntary exits and expiry fills in this segment;
  // R only prices the expiry fills, not every share in closed_position_qty.
  const averageClosePrice = completed && direction ? ownPrice(exit) : undefined;
  const averagePrice = direction ? ownPrice(entry) : undefined;
  const tradingFee =
    finiteBinaryNumber(row.trading_fee) && row.trading_fee >= 0
      ? row.trading_fee
      : undefined;
  const investment =
    quantity != null && averagePrice != null
      ? new Decimal(quantity).mul(averagePrice).toNumber()
      : undefined;
  const payout =
    quantity != null && averageClosePrice != null
      ? new Decimal(quantity).mul(averageClosePrice).toNumber()
      : undefined;
  const pnl =
    completed && finiteBinaryNumber(row.realized_pnl) && tradingFee != null
      ? new Decimal(row.realized_pnl).sub(tradingFee).toNumber()
      : undefined;
  const issues: string[] = [];
  if (!direction) issues.push("invalid_side");
  if (!window) issues.push("invalid_symbol");
  if (!timestamp(row.open_timestamp)) issues.push("invalid_open_time");
  if (!Number.isSafeInteger(row.position_id) || row.position_id < 0)
    issues.push("invalid_segment_id");
  if (quantity == null || quantity <= 0) issues.push("invalid_quantity");
  if (averagePrice == null) issues.push("invalid_entry_price");
  if (tradingFee == null) issues.push("missing_actual_fee");
  if (completed && (settlementPrice == null || payout == null || pnl == null))
    issues.push("missing_realized_amounts");
  if (row.outcome != null && (!outcome || !matchingResult))
    issues.push("invalid_result");
  if (
    completed &&
    investment != null &&
    payout != null &&
    finiteBinaryNumber(row.realized_pnl) &&
    new Decimal(payout).sub(investment).sub(row.realized_pnl).abs().gt(0.000001)
  )
    issues.push("amounts_do_not_reconcile");
  return {
    recordKey: `${row.symbol}:${row.position_id}:${row.open_timestamp}`,
    source: row,
    state,
    symbol: row.symbol,
    round: binaryRoundFromSymbol(row.symbol, row.open_timestamp) ?? 0,
    outcome: direction,
    result: state === "exit" ? "closed" : outcome,
    quantity,
    averagePrice,
    investment,
    tradingFee,
    settlementPrice,
    payout,
    pnl,
    openedAt: timestamp(row.open_timestamp) ? row.open_timestamp : undefined,
    completedAt: completed
      ? state === "settled"
        ? row.settled_at!
        : row.close_timestamp
      : undefined,
    issues,
  };
}

/** Preserve segment identity, selecting the latest server version, not summing duplicates. */
const historyIdentity = (record: BinaryHistoryRecord) =>
  JSON.stringify([
    record.state,
    record.symbol,
    record.outcome,
    record.result,
    record.quantity,
    record.averagePrice,
    record.investment,
    record.tradingFee,
    record.settlementPrice,
    record.payout,
    record.pnl,
    record.openedAt,
    record.completedAt,
    record.issues,
  ]);
export function uniqueBinaryHistory(records: readonly BinaryHistoryRecord[]) {
  const unique = new Map<string, BinaryHistoryRecord>();
  for (const record of records) {
    const previous = unique.get(record.recordKey);
    if (!previous) unique.set(record.recordKey, record);
    else {
      const before = previous.source.last_update_time;
      const after = record.source.last_update_time;
      if (timestamp(after) && (!timestamp(before) || after > before))
        unique.set(record.recordKey, record);
    }
  }
  // Only the latest revision can conflict; older known revisions are superseded.
  // An unversioned record cannot be proven older, so retain its conflict check.
  // The latest revision's identity string is computed once per key.
  const latestIdentities = new Map<string, string>();
  const conflict = records.some((record) => {
    const latest = unique.get(record.recordKey)!;
    let latestIdentity = latestIdentities.get(record.recordKey);
    if (latestIdentity === undefined) {
      latestIdentity = historyIdentity(latest);
      latestIdentities.set(record.recordKey, latestIdentity);
    }
    const before = latest.source.last_update_time;
    const after = record.source.last_update_time;
    return (
      latestIdentity !== historyIdentity(record) &&
      (!timestamp(before) || !timestamp(after) || before === after)
    );
  });
  return { records: [...unique.values()], conflict };
}

export function binaryHistoryRange(
  days: number,
  now = new Date(),
): BinaryHistoryRange {
  if (
    !Number.isInteger(days) ||
    days < 1 ||
    days > 90 ||
    !timestamp(now.getTime())
  )
    throw new RangeError("Invalid binary history range");
  const from = new Date(now);
  from.setDate(from.getDate() - days + 1);
  from.setHours(0, 0, 0, 0);
  return { from: from.getTime(), to: now.getTime() };
}

export function binaryHistoryCompleteness(input: {
  loaded: boolean;
  failed?: boolean;
  rowCount: number;
  limit: number;
  /** Verified evidence that the response exhausts or fully covers the requested window. */
  coverageVerified?: boolean;
  /** Explicit response truncation; reaching limit alone only establishes uncertainty. */
  truncated?: boolean;
}): BinaryHistoryCompleteness {
  if (input.failed || input.truncated) return "incomplete";
  if (
    !input.loaded ||
    !Number.isSafeInteger(input.rowCount) ||
    input.rowCount < 0 ||
    !Number.isSafeInteger(input.limit) ||
    input.limit <= 0
  )
    return "unknown";
  return input.coverageVerified ? "complete" : "unknown";
}

export function summarizeBinaryHistory(
  records: readonly BinaryHistoryRecord[],
  range: BinaryHistoryRange,
  completeness: BinaryHistoryCompleteness,
) {
  const result = {
    completeness,
    count: 0,
    investment: undefined as number | undefined,
    tradingFee: undefined as number | undefined,
    pnl: undefined as number | undefined,
  };
  if (!timestamp(range.from) || !timestamp(range.to) || range.from > range.to)
    return { ...result, completeness: "incomplete" as const };
  if (completeness !== "complete") return result;
  const unique = uniqueBinaryHistory(records);
  if (unique.conflict)
    return { ...result, completeness: "incomplete" as const };
  const selected: BinaryHistoryRecord[] = [];
  for (const record of unique.records) {
    const lastTime =
      record.completedAt ??
      record.source.close_timestamp ??
      record.source.last_update_time;
    if (timestamp(lastTime) && (lastTime < range.from || lastTime > range.to))
      continue;
    if (record.state === "pending") continue;
    if (
      record.state === "unknown" ||
      record.completedAt == null ||
      record.issues.length > 0
    )
      return { ...result, completeness: "incomplete" as const };
    if (record.completedAt <= range.to) selected.push(record);
  }
  const sum = (key: "investment" | "tradingFee" | "pnl") =>
    selected
      .reduce((total, record) => total.add(record[key]!), new Decimal(0))
      .toNumber();
  return {
    completeness: "complete" as const,
    count: selected.length,
    investment: sum("investment"),
    tradingFee: sum("tradingFee"),
    pnl: sum("pnl"),
  };
}

export type BinaryHistorySnapshot = {
  accountId: string;
  receivedAt: number;
  rows?: API.PositionHistory[];
};
/** Tag responses at fetch time, so late results cannot be consumed by another account. */
export function binaryHistorySnapshot(
  accountId: string,
  data: unknown,
  receivedAt = Date.now(),
): BinaryHistorySnapshot {
  const rows =
    data != null && typeof data === "object" && "rows" in data
      ? data.rows
      : undefined;
  return {
    accountId,
    receivedAt,
    rows:
      Array.isArray(rows) &&
      rows.every(
        (row) => row != null && typeof row === "object" && !Array.isArray(row),
      )
        ? rows
        : undefined,
  };
}
export function binaryHistoryForAccount(
  snapshot: BinaryHistorySnapshot | undefined,
  accountId: string | undefined,
  enabled: boolean,
) {
  return enabled && accountId && snapshot?.accountId === accountId
    ? snapshot
    : undefined;
}

/** Numeric NaN preserves the legacy field type and its existing Numeral placeholder. */
export function toPredictionSettlement(
  record: BinaryHistoryRecord,
): PredictionSettlement {
  return {
    id: record.source.position_id,
    symbol: record.symbol,
    round: record.round,
    outcome: record.outcome ?? "up",
    quantity: record.quantity ?? NaN,
    averagePrice: record.averagePrice ?? NaN,
    settlementPrice: record.settlementPrice ?? NaN,
    result: record.result,
    payout: record.payout ?? NaN,
    pnl: record.issues.length === 0 ? record.pnl : undefined,
    settledAt: record.completedAt,
    settling: record.state === "pending" || record.state === "unknown",
  };
}
