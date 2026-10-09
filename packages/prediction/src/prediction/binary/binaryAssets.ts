import { account } from "@orderly.network/perp";
import { MarginMode, OrderSide, type API } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import {
  ISO_ORDER_FROZEN_BUFFER,
  resolveBinaryCollateral,
} from "./binaryCollateral";
import { binaryHistoryWindow, finiteBinaryNumber } from "./binaryHistory";
import { isBinarySymbol } from "./binaryInfo";

const nonnegative = (value: unknown): value is number =>
  finiteBinaryNumber(value) && value >= 0;

/** USDC principal excludes unsettled PnL; equity uses the existing account calculation. */
export function binaryAccountFunds(input: {
  usdc?: Pick<
    API.Holding,
    "holding" | "isolated_margin" | "isolated_order_frozen"
  >;
  freeCollateral?: number;
  maxWithdrawal?: number;
  equity?: number;
}) {
  const { usdc } = input;
  const principal =
    usdc &&
    finiteBinaryNumber(usdc.holding) &&
    nonnegative(usdc.isolated_margin)
      ? account
          .totalValue({
            USDCHolding: usdc.holding,
            nonUSDCHolding: [],
            totalUnsettlementPnL: 0,
            totalIsolatedPositionMargin: usdc.isolated_margin,
          })
          .toNumber()
      : undefined;
  const locked =
    usdc &&
    nonnegative(usdc.isolated_margin) &&
    nonnegative(usdc.isolated_order_frozen)
      ? new Decimal(usdc.isolated_margin)
          .add(usdc.isolated_order_frozen)
          .toNumber()
      : undefined;
  return {
    scope: "account" as const,
    asset: "USDC" as const,
    source: "account_facts" as const,
    principal,
    crossBalance:
      usdc && finiteBinaryNumber(usdc.holding) ? usdc.holding : undefined,
    isolatedLocked: locked,
    available:
      usdc && finiteBinaryNumber(input.freeCollateral)
        ? Math.max(0, input.freeCollateral)
        : undefined,
    withdrawable:
      usdc && nonnegative(input.maxWithdrawal)
        ? input.maxWithdrawal
        : undefined,
    equity: finiteBinaryNumber(input.equity) ? input.equity : undefined,
  };
}

export function binaryPositionValue(
  position: { quantity: number; averagePrice: number; outcome: "up" | "down" },
  upLastTrade?: number,
) {
  if (
    !nonnegative(position.quantity) ||
    !nonnegative(position.averagePrice) ||
    position.averagePrice > 1 ||
    !nonnegative(upLastTrade) ||
    upLastTrade > 1
  )
    return { price: undefined, value: undefined, pnl: undefined };
  const price =
    position.outcome === "up"
      ? upLastTrade
      : new Decimal(1).sub(upLastTrade).toNumber();
  return {
    price,
    value: new Decimal(position.quantity).mul(price).toNumber(),
    pnl: new Decimal(price)
      .sub(position.averagePrice)
      .mul(position.quantity)
      .toNumber(),
  };
}

/** Estimate each round independently; source aggregates are never added twice. */
export function binaryLockedFunds(input: {
  positions?: readonly API.Position[];
  orders?: readonly (API.Order | API.AlgoOrder)[];
  ordersComplete: boolean;
  rounds?: readonly { symbol: string; expire_at: number }[];
  markPrices?: Record<string, number>;
}) {
  const symbols = new Set(
    [
      ...(input.positions ?? []).map((row) => row.symbol),
      ...(input.orders ?? []).map((row) => row.symbol),
    ].filter(isBinarySymbol),
  );
  return [...symbols].sort().flatMap((symbol) => {
    const position = input.positions?.find((row) => row.symbol === symbol);
    const snapshot = resolveBinaryCollateral({
      symbol,
      positions: input.positions ? [...input.positions] : undefined,
      orders: input.orders ? [...input.orders] : undefined,
      ordersComplete: input.ordersComplete,
      markPrice: input.markPrices?.[symbol],
    });
    const margin = position
      ? position.margin_mode === MarginMode.ISOLATED &&
        nonnegative(position.margin)
        ? position.margin
        : undefined
      : input.positions
        ? 0
        : undefined;
    const frozen = snapshot
      ? account
          .isolatedPendingOrdersFrozen({
            positionQty: snapshot.positionQty,
            orders: snapshot.orders,
            leverage: 1,
            isoTakerFeeBuffer: ISO_ORDER_FROZEN_BUFFER,
            getMarginPrice: (order) =>
              order.side === OrderSide.BUY
                ? order.referencePrice
                : new Decimal(1).sub(order.referencePrice).toNumber(),
          })
          .toNumber()
      : undefined;
    if (margin === 0 && frozen === 0 && snapshot?.positionQty === 0) return [];
    const expiry = input.rounds?.find(
      (row) => row.symbol === symbol,
    )?.expire_at;
    return [
      {
        symbol,
        scope: "BINARY" as const,
        positionMargin: margin,
        orderFrozen: frozen,
        total:
          margin != null && frozen != null
            ? new Decimal(margin).add(frozen).toNumber()
            : undefined,
        marginSource:
          margin == null ? ("unavailable" as const) : ("server" as const),
        orderSource:
          frozen == null ? ("unavailable" as const) : ("estimated" as const),
        estimateMode: snapshot?.mode ?? "unavailable",
        expectedReleaseAt:
          nonnegative(expiry) && expiry > 0
            ? expiry
            : binaryHistoryWindow(symbol)?.to,
        releaseSource: "estimated" as const,
      },
    ];
  });
}
