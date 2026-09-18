import { Decimal } from "@orderly.network/utils";

export type PredictionOrderPolicy = "gtc" | "postOnly" | "ioc" | "fok";

/** Plan execution of a prototype limit order against the displayed mock book. */
export function planPredictionExecution(
  policy: PredictionOrderPolicy,
  side: "buy" | "sell",
  price: number,
  quantity: number,
  levels: { price: number; quantity: number }[],
) {
  if (policy === "gtc")
    return { filled: 0, cancelled: 0, pending: quantity, price };
  const matching = levels
    .filter((level) =>
      side === "buy" ? level.price <= price : level.price >= price,
    )
    .sort((a, b) => (side === "buy" ? a.price - b.price : b.price - a.price));
  if (policy === "postOnly") {
    const crosses = matching.some((level) => level.quantity > 0);
    return {
      filled: 0,
      cancelled: crosses ? quantity : 0,
      pending: crosses ? 0 : quantity,
      price,
    };
  }
  let remaining = new Decimal(quantity);
  let notional = new Decimal(0);
  for (const level of matching) {
    const fill = remaining.lte(level.quantity)
      ? remaining
      : new Decimal(level.quantity);
    notional = notional.add(fill.mul(level.price));
    remaining = remaining.sub(fill);
    if (remaining.lte(0)) break;
  }
  if (policy === "fok" && remaining.gt(0))
    return { filled: 0, cancelled: quantity, pending: 0, price };
  const filled = new Decimal(quantity).sub(remaining);
  return {
    filled: filled.toNumber(),
    cancelled: remaining.toNumber(),
    pending: 0,
    price: filled.gt(0) ? notional.div(filled).toNumber() : price,
  };
}
