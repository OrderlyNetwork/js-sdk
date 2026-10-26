import type { API } from "@orderly.network/types";
import type { PredictionPosition } from "../prediction.types";
import { binaryRoundFromSymbol, isBinarySymbol } from "./binaryInfo";
import { complementPrice } from "./binaryOrderRules";

export function toPredictionPosition(
  row: API.Position,
  accountId?: string,
): PredictionPosition {
  const up = row.position_qty > 0;
  return {
    accountId: accountId ?? row.account_id,
    marginMode: row.margin_mode,
    outcome: up ? "up" : "down",
    quantity: Math.abs(row.position_qty),
    averagePrice: up
      ? row.average_open_price
      : complementPrice(row.average_open_price),
    markPrice: Number.isFinite(row.mark_price)
      ? up
        ? row.mark_price
        : complementPrice(row.mark_price)
      : undefined,
    symbol: row.symbol,
    round: binaryRoundFromSymbol(row.symbol) ?? undefined,
  };
}

export const predictionPositionKey = (position: PredictionPosition) =>
  `${position.accountId ?? ""}:${position.symbol ?? ""}:${position.outcome}`;

/** The live account is authoritative, even if the aggregate snapshot is older. */
export function mergeManagedPredictionPositions(
  current: PredictionPosition[],
  aggregate: API.PositionExt[] | undefined,
  currentAccountId: string | undefined,
  childIds: string[],
): PredictionPosition[] {
  if (!currentAccountId) return [];
  const positions: PredictionPosition[] = current
    .filter((row) => row.quantity > 0)
    .map((row) => ({ ...row, accountId: currentAccountId }));
  for (const row of aggregate ?? []) {
    if (
      row.account_id &&
      row.account_id !== currentAccountId &&
      childIds.includes(row.account_id) &&
      isBinarySymbol(row.symbol) &&
      Number.isFinite(row.position_qty) &&
      row.position_qty !== 0
    )
      positions.push(toPredictionPosition(row));
  }
  return [
    ...new Map(
      positions.map((row) => [predictionPositionKey(row), row]),
    ).values(),
  ];
}

export interface BinaryPendingSnapshot {
  rows: API.Order[];
  meta: { total: number };
}
/** Read every pending-order page before allowing a target-account close. */
export async function loadBinaryPendingSnapshot(
  first: BinaryPendingSnapshot,
  fetchPage: (page: number) => Promise<BinaryPendingSnapshot>,
): Promise<BinaryPendingSnapshot> {
  const rows = new Map<number, API.Order>();
  let page = 1;
  let data = first;
  while (true) {
    if (
      !Array.isArray(data?.rows) ||
      !Number.isInteger(data.meta?.total) ||
      data.meta.total < 0
    )
      throw new Error("Invalid pending-order snapshot");
    const previous = rows.size;
    for (const row of data.rows)
      if (isBinarySymbol(row.symbol)) rows.set(row.order_id, row);
    if (rows.size >= data.meta.total)
      return { rows: [...rows.values()], meta: { total: data.meta.total } };
    if (rows.size === previous || data.rows.length === 0)
      throw new Error("Incomplete pending-order snapshot");
    data = await fetchPage(++page);
  }
}
