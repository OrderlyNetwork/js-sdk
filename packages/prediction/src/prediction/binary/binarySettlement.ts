import { Decimal } from "@orderly.network/utils";
import type { PredictionPosition } from "../prediction.types";
import {
  binaryHistoryWindow,
  finiteBinaryNumber,
  toPredictionSettlement,
  uniqueBinaryHistory,
  type BinaryHistoryRecord,
} from "./binaryHistory";
import {
  isBinaryRowTradable,
  type BinaryInfoDetail,
  type BinaryInfoRow,
} from "./binaryInfo";

/** Public publication is independent of a user's system close. */
export function publishedBinaryOutcome(row?: BinaryInfoRow) {
  if (
    !row ||
    !finiteBinaryNumber(row.result_committed_at) ||
    row.result_committed_at <= 0 ||
    !finiteBinaryNumber(row.s0) ||
    !finiteBinaryNumber(row.s1) ||
    row.s0 < 0 ||
    row.s1 < 0
  )
    return undefined;
  if (row.outcome === "UP" && row.settlement_price_per_share === 1)
    return "up" as const;
  if (row.outcome === "DOWN" && row.settlement_price_per_share === 0)
    return "down" as const;
  return undefined;
}

export function hasBinaryPriceEvidence(row?: BinaryInfoDetail) {
  const evidence = row?.price_evidence;
  return !!(
    row &&
    publishedBinaryOutcome(row) &&
    evidence &&
    evidence.s0?.price === row.s0 &&
    evidence.s1?.price === row.s1 &&
    evidence.s0.timestamp === row.observation_start_at &&
    evidence.s1.timestamp === row.expire_at &&
    evidence.s0.source === "live" &&
    evidence.s1.source === "live"
  );
}

/** Keep the SWR callback stable across market-driven renders. */
export function binaryDetailRefreshInterval(detail?: BinaryInfoDetail) {
  return hasBinaryPriceEvidence(detail) ? 0 : 5_000;
}

/** Do not let an older unpublished detail erase an already published snapshot. */
export function mergeBinaryDetail(
  row?: BinaryInfoDetail,
  detail?: BinaryInfoDetail,
) {
  if (!row || detail?.symbol !== row.symbol) return row;
  if (publishedBinaryOutcome(row) && !publishedBinaryOutcome(detail))
    return row;
  if (
    row.result_committed_at != null &&
    (detail.result_committed_at == null ||
      detail.result_committed_at < row.result_committed_at)
  )
    return row;
  if (
    Object.entries(detail).every(
      ([key, value]) => row[key as keyof BinaryInfoDetail] === value,
    )
  )
    return row;
  return { ...row, ...detail };
}

export function nextTradableBinaryRound(
  rows: readonly BinaryInfoRow[],
  now: number,
) {
  return rows
    .filter(
      (row) => Number.isFinite(row.expire_at) && isBinaryRowTradable(row, now),
    )
    .sort(
      (a, b) => a.expire_at - b.expire_at || a.symbol.localeCompare(b.symbol),
    )[0];
}

/** Filtering time must never become a synthetic completion timestamp. */
export function binaryHistoryFilterTime(record: BinaryHistoryRecord) {
  if (finiteBinaryNumber(record.completedAt)) return record.completedAt;
  const expiry = binaryHistoryWindow(record.symbol)?.to;
  if (expiry != null) return expiry;
  return [
    record.source.last_update_time,
    record.source.close_timestamp,
    record.openedAt,
  ].find((value) => finiteBinaryNumber(value) && value > 0);
}

/** Conflicting revisions only block their own position segment. */
export function binaryHistorySegments(records: readonly BinaryHistoryRecord[]) {
  // One full dedupe; the per-key conflict scan only revisits duplicate keys.
  const unique = uniqueBinaryHistory(records);
  const groups = new Map<string, BinaryHistoryRecord[]>();
  for (const record of records) {
    const group = groups.get(record.recordKey);
    if (group) group.push(record);
    else groups.set(record.recordKey, [record]);
  }
  const conflictedRecordKeys: string[] = [];
  for (const [key, group] of groups) {
    if (group.length > 1 && uniqueBinaryHistory(group).conflict)
      conflictedRecordKeys.push(key);
  }
  return { ...unique, conflictedRecordKeys };
}

export function binaryHistoryDisplayRows(
  records: readonly BinaryHistoryRecord[],
) {
  const unique = binaryHistorySegments(records);
  const conflicted = new Set(unique.conflictedRecordKeys);
  return unique.records.map((record) => ({
    ...toPredictionSettlement(record),
    recordKey: record.recordKey,
    outcome: record.outcome,
    result: record.result,
    pnl: conflicted.has(record.recordKey)
      ? undefined
      : record.issues.length === 0
        ? record.pnl
        : undefined,
    settledAt:
      conflicted.has(record.recordKey) || record.issues.length > 0
        ? undefined
        : record.completedAt,
    filterTime: binaryHistoryFilterTime(record),
  }));
}

export type BinarySettlementHolding = {
  symbol: string;
  outcome: PredictionPosition["outcome"];
  quantity: number;
  observedAt: number;
};

/** Retain observed holdings past T1 until personal history confirms their close. */
export function observeBinarySettlementHoldings(
  previous: readonly BinarySettlementHolding[],
  positions: readonly Pick<
    PredictionPosition,
    "symbol" | "quantity" | "outcome"
  >[],
  now: number,
) {
  const next = new Map(
    previous
      .filter(
        (holding) =>
          (binaryHistoryWindow(holding.symbol)?.to ?? Infinity) <= now,
      )
      .map((holding) => [holding.symbol, holding]),
  );
  const previousBySymbol = new Map(
    previous.map((holding) => [holding.symbol, holding]),
  );
  for (const position of positions) {
    if (
      !position.symbol ||
      position.quantity <= 0 ||
      !Number.isFinite(position.quantity)
    )
      continue;
    const prior =
      next.get(position.symbol) ?? previousBySymbol.get(position.symbol);
    next.set(
      position.symbol,
      prior &&
        prior.outcome === position.outcome &&
        (prior.quantity === position.quantity ||
          (binaryHistoryWindow(position.symbol)?.to ?? Infinity) <= now)
        ? prior
        : {
            symbol: position.symbol,
            outcome: position.outcome,
            quantity: position.quantity,
            observedAt: now,
          },
    );
  }
  return [...next.values()];
}

export type BinarySettlementWatch = {
  accountId?: string;
  holdings: BinarySettlementHolding[];
  initialized: boolean;
};

/** Seed a new account from its private REST response, never the previous stream. */
export function updateBinarySettlementWatch(
  previous: BinarySettlementWatch,
  input: {
    accountId?: string;
    active: boolean;
    positions: readonly Pick<
      PredictionPosition,
      "symbol" | "quantity" | "outcome"
    >[];
    seedPositions?: readonly Pick<
      PredictionPosition,
      "symbol" | "quantity" | "outcome"
    >[];
    now: number;
  },
): BinarySettlementWatch {
  const sameAccount = previous.accountId === input.accountId;
  const prior = sameAccount ? previous.holdings : [];
  const initialized =
    !!input.accountId &&
    ((sameAccount && previous.initialized) ||
      (input.active && input.seedPositions != null));
  const holdings = !input.accountId
    ? []
    : !input.active
      ? prior
      : !initialized
        ? []
        : observeBinarySettlementHoldings(
            prior,
            sameAccount && previous.initialized
              ? input.positions
              : input.seedPositions!,
            input.now,
          );
  if (
    sameAccount &&
    previous.initialized === initialized &&
    JSON.stringify(prior) === JSON.stringify(holdings)
  )
    return previous;
  return { accountId: input.accountId, holdings, initialized };
}

export function pendingBinarySettlements(
  records: readonly BinaryHistoryRecord[],
  holdings: readonly BinarySettlementHolding[],
  now: number,
) {
  const unique = binaryHistorySegments(records);
  const conflicted = new Set(unique.conflictedRecordKeys);
  const pending = new Set(
    unique.records
      .filter(
        (record) =>
          (binaryHistoryWindow(record.symbol)?.to ?? Infinity) <= now &&
          record.state !== "exit" &&
          (record.state !== "settled" ||
            record.issues.length > 0 ||
            conflicted.has(record.recordKey)),
      )
      .map((record) => record.symbol),
  );
  // Pre-index clean settled/exit records per (symbol, outcome) once instead
  // of rescanning every record per holding.
  const closedByKey = new Map<string, BinaryHistoryRecord[]>();
  for (const record of unique.records) {
    if (record.issues.length > 0 || conflicted.has(record.recordKey)) continue;
    if (record.state !== "settled" && record.state !== "exit") continue;
    const key = `${record.symbol}:${record.outcome}`;
    const group = closedByKey.get(key);
    if (group) group.push(record);
    else closedByKey.set(key, [record]);
  }
  for (const holding of holdings) {
    if ((binaryHistoryWindow(holding.symbol)?.to ?? Infinity) > now) continue;
    const closed = (
      closedByKey.get(`${holding.symbol}:${holding.outcome}`) ?? []
    ).filter((record) =>
      record.state === "settled"
        ? true
        : (record.completedAt ?? 0) >= holding.observedAt,
    );
    const closedQuantity = closed.reduce(
      (sum, record) => sum.add(record.quantity ?? 0),
      new Decimal(0),
    );
    if (closedQuantity.lt(holding.quantity)) pending.add(holding.symbol);
  }
  return [...pending];
}

export function binarySettlementRefreshInterval(
  enabled: boolean,
  pending: readonly string[],
) {
  return !enabled ? 0 : pending.length ? 5_000 : 60_000;
}

export function binaryRoundPersonalRecords(
  records: readonly BinaryHistoryRecord[],
  symbol?: string,
) {
  const unique = binaryHistorySegments(
    records.filter((record) => record.symbol === symbol),
  );
  return {
    ...unique,
    // Voluntary closes remain separate from expiry payout.
    expiryRecords: unique.records.filter((record) => record.state !== "exit"),
  };
}

export function isBinarySettlementComplete(
  record: BinaryHistoryRecord,
  conflict = false,
) {
  return (
    !conflict &&
    record.state === "settled" &&
    record.issues.length === 0 &&
    [
      record.investment,
      record.tradingFee,
      record.payout,
      record.pnl,
      record.completedAt,
    ].every(finiteBinaryNumber)
  );
}

/** A completed segment is verifiable even when whole-query coverage is unknown. */
export function binaryPersonalSettlementStatus(
  records: readonly BinaryHistoryRecord[],
  conflict: boolean,
  knownPending: boolean,
) {
  if (
    knownPending ||
    records.some(
      (record) => record.state === "pending" || record.state === "unknown",
    )
  )
    return "processing" as const;
  if (conflict || records.some((record) => !isBinarySettlementComplete(record)))
    return "incomplete" as const;
  return undefined;
}
