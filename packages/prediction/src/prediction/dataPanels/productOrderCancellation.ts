import { settleOrderCancellations } from "@orderly.network/hooks";
import { AlgoOrderRootType, type API } from "@orderly.network/types";
import { isBinarySymbol } from "../binary/binaryInfo";
import { matchesPredictionUnderlying } from "../binary/productScope";

export type ProductOrderInstrument = "all" | "perps" | "prediction";
export type BinaryCancelAllOptions = {
  /** Underlying PERP symbol, for example PERP_BTC_USDC; includes all its rounds. */
  underlyingSymbol?: string;
};

export type ProductCancellationTarget = {
  product: "PERP" | "BINARY";
  symbol: string;
};
export type ProductCancellationSnapshot = {
  perps: { symbol: string; algo_order_id?: number; algo_type?: string }[];
  perpsComplete: boolean;
  binary: { symbol?: string }[];
  binaryComplete: boolean;
  includePrediction: boolean;
  includePerps?: boolean;
  perpsSymbol?: string;
  predictionUnderlyingSymbol?: string;
  regionRestricted: boolean;
  isBinaryTradable: (symbol?: string) => boolean;
};

/** Duplicate rows across changing pages cannot count toward completeness. */
export function cancellationOrdersSnapshot(pages?: API.OrderResponse[]) {
  const unique = new Map<string, API.Order | API.AlgoOrder>();
  for (const page of pages ?? []) {
    if (!Array.isArray(page?.rows))
      return { orders: [], total: undefined, complete: false };
    for (const order of page.rows) {
      const id = order.algo_order_id
        ? `algo:${order.algo_order_id}`
        : `order:${(order as API.Order).order_id}`;
      unique.set(id, order);
    }
  }
  const orders = Array.from(unique.values());
  const total = pages?.[0]?.meta?.total;
  return {
    orders,
    total,
    complete:
      total != null &&
      Number.isInteger(total) &&
      total >= 0 &&
      orders.length >= total,
  };
}

/** All requests are symbol scoped; a read-side product filter is insufficient. */
export function productCancellationTargets(
  snapshot: ProductCancellationSnapshot,
): ProductCancellationTarget[] | undefined {
  if (
    (snapshot.includePerps !== false && !snapshot.perpsComplete) ||
    (snapshot.includePrediction &&
      (!snapshot.binaryComplete || snapshot.regionRestricted))
  )
    return undefined;
  const perps = new Set(
    (snapshot.includePerps === false ? [] : snapshot.perps)
      .filter(
        (order) =>
          !isBinarySymbol(order.symbol) &&
          (!snapshot.perpsSymbol || order.symbol === snapshot.perpsSymbol) &&
          (!order.algo_order_id ||
            [AlgoOrderRootType.STOP, AlgoOrderRootType.TRAILING_STOP].includes(
              order.algo_type as AlgoOrderRootType,
            )),
      )
      .map((order) => order.symbol)
      .filter(Boolean),
  );
  const binary = new Set(
    snapshot.includePrediction
      ? snapshot.binary
          .map((order) => order.symbol)
          .filter((symbol): symbol is string =>
            Boolean(
              symbol &&
              isBinarySymbol(symbol) &&
              matchesPredictionUnderlying(
                symbol,
                snapshot.predictionUnderlyingSymbol,
              ) &&
              snapshot.isBinaryTradable(symbol),
            ),
          )
      : [],
  );
  return [
    ...Array.from(perps, (symbol) => ({ product: "PERP" as const, symbol })),
    ...Array.from(binary, (symbol) => ({ product: "BINARY" as const, symbol })),
  ];
}

/** Preserve the existing PERP pending cancellation types, including algo orders. */
export async function cancelProductTargets(
  getTargets: () => ProductCancellationTarget[] | undefined,
  cancelOrders: (symbol: string) => Promise<unknown>,
  cancelAlgoOrders: (
    symbol: string,
    type: AlgoOrderRootType,
  ) => Promise<unknown>,
): Promise<boolean> {
  const targets = getTargets();
  if (!targets?.length) return false;
  let executed = false;
  for (const target of targets) {
    const current = getTargets();
    if (!current) return false;
    // A Binary round may close while a previous symbol's request is in flight.
    if (
      !current.some(
        (item) =>
          item.product === target.product && item.symbol === target.symbol,
      )
    )
      continue;
    await settleOrderCancellations([
      cancelOrders(target.symbol),
      ...(target.product === "PERP"
        ? [
            cancelAlgoOrders(target.symbol, AlgoOrderRootType.STOP),
            cancelAlgoOrders(target.symbol, AlgoOrderRootType.TRAILING_STOP),
          ]
        : []),
    ]);
    executed = true;
  }
  return executed;
}
