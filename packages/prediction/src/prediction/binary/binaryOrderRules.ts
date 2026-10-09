import { OrderSide } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import type {
  PredictionOrderBookLevel,
  PredictionOrderSide,
  PredictionOutcome,
} from "../prediction.types";
import type { BinaryInfoRow } from "./binaryInfo";
import type { BinaryOrderBook } from "./useBinaryOrderbook";

/** Preserve backend rejection details verbatim; whitespace alone is not a detail. */
export function binaryRejectionNotice(
  error: unknown,
  fallback = "prediction.message.orderFailed",
) {
  const message =
    typeof error === "string"
      ? error
      : error && typeof error === "object" && "message" in error
        ? error.message
        : undefined;
  return typeof message === "string" && message.trim() ? message : fallback;
}

export const validBinaryFee = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

export function quoteToBinaryQuantity(
  amount: number | string,
  price: number,
  tick = 0.01,
): number {
  if (
    !Number.isFinite(Number(amount)) ||
    Number(amount) <= 0 ||
    !Number.isFinite(price) ||
    price <= 0 ||
    price >= 1 ||
    !Number.isFinite(tick) ||
    tick <= 0
  )
    return 0;
  return new Decimal(amount)
    .div(price)
    .div(tick)
    .toDecimalPlaces(0, Decimal.ROUND_FLOOR)
    .mul(tick)
    .toNumber();
}

/** Choose the largest cent-denominated input that still sizes affordably. */
export function binaryMaxQuoteInput(
  quantity: number,
  price: number,
  tick = 0.01,
): number {
  if (
    !Number.isFinite(quantity) ||
    quantity <= 0 ||
    !Number.isFinite(price) ||
    price <= 0 ||
    price >= 1
  )
    return 0;
  const principal = new Decimal(quantity).mul(price);
  const rounded = principal.toDecimalPlaces(2, Decimal.ROUND_CEIL);
  return quoteToBinaryQuantity(rounded.toString(), price, tick) <= quantity
    ? rounded.toNumber()
    : principal.toDecimalPlaces(2, Decimal.ROUND_FLOOR).toNumber();
}

export const parseSlippageTicks = (value: string): number | undefined => {
  if (!/^\d+$/.test(value)) return undefined;
  const ticks = Number(value);
  return ticks >= 0 && ticks <= 10 ? ticks : undefined;
};

export const toBinaryUpRequest = (
  outcome: PredictionOutcome,
  side: PredictionOrderSide,
  price: number,
) => ({
  upSide:
    (side === "buy") === (outcome === "up") ? OrderSide.BUY : OrderSide.SELL,
  upPrice: outcome === "up" ? price : new Decimal(1).sub(price).toNumber(),
});

export function binaryProtectionPrice(
  outcome: PredictionOutcome,
  side: PredictionOrderSide,
  bbo: { bestAsk?: number; bestBid?: number },
  slippage: string,
  config?: BinaryInfoRow,
): number | undefined {
  const ticks = parseSlippageTicks(slippage);
  const { upSide } = toBinaryUpRequest(outcome, side, 0);
  const best = upSide === OrderSide.BUY ? bbo.bestAsk : bbo.bestBid;
  if (
    ticks == null ||
    best == null ||
    !Number.isFinite(best) ||
    best <= 0 ||
    best >= 1
  )
    return undefined;
  const tick = config?.quote_tick ?? 0.01;
  const min = config?.quote_min ?? tick;
  const max = config?.quote_max ?? new Decimal(1).sub(tick).toNumber();
  const offset = new Decimal(tick).mul(ticks);
  let price = (
    upSide === OrderSide.BUY
      ? new Decimal(best).add(offset)
      : new Decimal(best).sub(offset)
  )
    .div(tick)
    .toDecimalPlaces(
      0,
      upSide === OrderSide.BUY ? Decimal.ROUND_CEIL : Decimal.ROUND_FLOOR,
    )
    .mul(tick);
  if (price.lt(min)) price = new Decimal(min);
  if (price.gt(max)) price = new Decimal(max);
  return outcome === "up"
    ? price.toNumber()
    : new Decimal(1).sub(price).toNumber();
}

/** Absolute VWAP movement in ticks. Partial depth is permitted for IOC orders. */
export function estimateBinarySlippage(
  side: PredictionOrderSide,
  quantity: number,
  book: { asks: PredictionOrderBookLevel[]; bids: PredictionOrderBookLevel[] },
  tick = 0.01,
): number | null {
  if (
    !Number.isFinite(quantity) ||
    quantity <= 0 ||
    !Number.isFinite(tick) ||
    tick <= 0
  )
    return null;
  const levels = [...(side === "buy" ? book.asks : book.bids)]
    .filter(
      (row) =>
        Number.isFinite(row.price) &&
        row.price > 0 &&
        row.price < 1 &&
        Number.isFinite(row.quantity) &&
        row.quantity > 0,
    )
    .sort((a, b) => (side === "buy" ? a.price - b.price : b.price - a.price));
  if (!levels.length) return null;
  let remaining = new Decimal(quantity);
  let notional = new Decimal(0);
  for (const level of levels) {
    const fill = remaining.lt(level.quantity)
      ? remaining
      : new Decimal(level.quantity);
    notional = notional.add(fill.mul(level.price));
    remaining = remaining.sub(fill);
    if (remaining.lte(0)) break;
  }
  return notional
    .div(new Decimal(quantity).sub(remaining))
    .sub(levels[0].price)
    .abs()
    .div(tick)
    .toNumber();
}

/** Recheck only the unsent quantity against the current executable depth. */
export function isBinaryMarketBatchAllowed(input: {
  outcome: PredictionOutcome;
  side: PredictionOrderSide;
  remainingQuantity: number;
  displayPrice: number;
  bbo: { bestAsk?: number; bestBid?: number };
  book: BinaryOrderBook;
  slippage: string;
  config: BinaryInfoRow;
}): boolean {
  const {
    outcome,
    side,
    remainingQuantity,
    displayPrice,
    bbo,
    book,
    slippage,
    config,
  } = input;
  const protection = binaryProtectionPrice(
    outcome,
    side,
    bbo,
    slippage,
    config,
  );
  const ticks = parseSlippageTicks(slippage);
  if (
    protection == null ||
    ticks == null ||
    (side === "buy"
      ? new Decimal(displayPrice).gt(protection)
      : new Decimal(displayPrice).lt(protection))
  )
    return false;
  const levels =
    outcome === "up"
      ? { asks: book.asks, bids: book.bids }
      : { asks: book.downAsks, bids: book.downBids };
  const estimated = estimateBinarySlippage(
    side,
    remainingQuantity,
    {
      asks: levels.asks.map(([price, quantity]) => ({ price, quantity })),
      bids: levels.bids.map(([price, quantity]) => ({ price, quantity })),
    },
    config.quote_tick ?? 0.01,
  );
  return estimated != null && estimated <= ticks;
}

export type BinarySizeRules = Pick<
  BinaryInfoRow,
  "base_min" | "base_max" | "base_tick" | "min_notional"
>;

/** Balance children on the integer tick grid so the tail never becomes dust. */
export function splitBinaryQuantity(
  quantity: number,
  upPrice: number,
  config: BinarySizeRules,
): number[] | undefined {
  const tick = config.base_tick ?? 0.01;
  const max = config.base_max ?? 10000;
  if (
    ![quantity, upPrice, tick, max].every(Number.isFinite) ||
    quantity <= 0 ||
    upPrice <= 0 ||
    upPrice >= 1 ||
    tick <= 0 ||
    max <= 0
  )
    return undefined;
  const totalTicks = new Decimal(quantity).div(tick);
  if (!totalTicks.isInteger()) return undefined;
  const maxTicks = new Decimal(max)
    .div(tick)
    .toDecimalPlaces(0, Decimal.ROUND_FLOOR);
  const minTicks = new Decimal(config.min_notional ?? 5)
    .div(upPrice)
    .div(tick)
    .toDecimalPlaces(0, Decimal.ROUND_CEIL);
  const baseMinTicks = new Decimal(config.base_min ?? tick)
    .div(tick)
    .toDecimalPlaces(0, Decimal.ROUND_CEIL);
  const minimum = minTicks.gt(baseMinTicks) ? minTicks : baseMinTicks;
  if (maxTicks.lt(minimum)) return undefined;
  const count = totalTicks
    .div(maxTicks)
    .toDecimalPlaces(0, Decimal.ROUND_CEIL)
    .toNumber();
  if (
    !Number.isSafeInteger(count) ||
    count > 100000 ||
    totalTicks.lt(minimum.mul(count))
  )
    return undefined;
  const each = totalTicks.div(count).toDecimalPlaces(0, Decimal.ROUND_FLOOR);
  const extra = totalTicks.sub(each.mul(count)).toNumber();
  return Array.from({ length: count }, (_, i) =>
    each
      .add(i < extra ? 1 : 0)
      .mul(tick)
      .toNumber(),
  );
}

type BinaryResponseRow = {
  order_id?: number | string;
  success?: boolean;
  code?: number | string;
  message?: string;
  rows?: unknown;
};

export type BinarySubmissionResult = {
  accepted: number;
  failed: number;
  unknown: number;
  unsent: number;
  error?: unknown;
};

/** Stop on partial or ambiguous acceptance; a POST must never be retried blindly. */
/** Status summaries and backend details share one notification without a Sell prefix. */
export function binarySubmissionNotice(
  result: BinarySubmissionResult,
  context: {
    batched: boolean;
    fallback: string;
    batchSummary: string;
    unknownSummary: string;
  },
) {
  const detail =
    binaryRejectionNotice(result.error, "") ||
    (result.unknown > 0 ? "" : context.fallback);
  const summary = context.batched
    ? context.batchSummary
    : result.unknown > 0
      ? context.unknownSummary
      : "";
  return summary ? (detail ? `${summary} ${detail}` : summary) : detail;
}

export async function submitBinaryBatches(
  orders: Record<string, unknown>[],
  submit: (orders: Record<string, unknown>[]) => Promise<unknown>,
  canSubmit: () => boolean = () => true,
): Promise<BinarySubmissionResult> {
  const result: BinarySubmissionResult = {
    accepted: 0,
    failed: 0,
    unknown: 0,
    unsent: orders.length,
  };
  for (let offset = 0; offset < orders.length; offset += 20) {
    const batch = orders.slice(offset, offset + 20);
    if (!canSubmit()) {
      result.error = new Error("Order is no longer tradable.");
      break;
    }
    result.unsent -= batch.length;
    try {
      const response = (await submit(batch)) as
        | {
            success?: boolean;
            message?: string;
            data?:
              | { rows?: BinaryResponseRow[] }
              | BinaryResponseRow[]
              | BinaryResponseRow;
          }
        | undefined;
      const data = response?.data;
      const rows: BinaryResponseRow[] = Array.isArray(data)
        ? data
        : data && Array.isArray(data.rows)
          ? (data.rows as BinaryResponseRow[])
          : batch.length === 1 && data
            ? [data as BinaryResponseRow]
            : [];
      let accepted = 0;
      let failed = 0;
      const ids = new Set<number>();
      for (const row of rows.slice(0, batch.length)) {
        if (!row || typeof row !== "object") continue;
        if (row.success === false || (row.code != null && Number(row.code) < 0))
          failed++;
        else if (
          Number.isFinite(Number(row.order_id)) &&
          Number(row.order_id) > 0 &&
          !ids.has(Number(row.order_id))
        ) {
          accepted++;
          ids.add(Number(row.order_id));
        }
      }
      const unknown =
        response?.success === false && accepted === 0
          ? 0
          : batch.length - accepted - failed;
      if (response?.success === false && accepted === 0) failed = batch.length;
      result.accepted += accepted;
      result.failed += failed;
      result.unknown += unknown;
      if (failed || unknown || response?.success !== true) {
        result.error = new Error(
          binaryRejectionNotice(
            response,
            rows.map((row) => binaryRejectionNotice(row, "")).find(Boolean) ??
              (unknown > 0 ? "Order acceptance could not be confirmed." : ""),
          ),
        );
        break;
      }
    } catch (error) {
      // The net layer uses ApiError for explicit HTTP 400 rejections.
      // Transport failures remain ambiguous and must never trigger a retry.
      if (error instanceof Error && error.name === "ApiError")
        result.failed += batch.length;
      else result.unknown += batch.length;
      result.error = error ?? new Error("");
      break;
    }
  }
  return result;
}
