import { Decimal } from "@orderly.network/utils";

export function checkNotional(props: {
  base_tick: number;
  price?: string | number;
  qty?: string | number;
  min_notional?: number;
  quote_dp?: number;
  quote_tick?: number;
}): string | undefined {
  const { price, base_tick, qty, min_notional, quote_dp, quote_tick } = props;
  if (price !== undefined && qty !== undefined && min_notional !== undefined) {
    try {
      const calcNotional = new Decimal(price).mul(new Decimal(qty)).toNumber();
      const notional = Number.parseFloat(`${min_notional}`);

      const newMinNotional = new Decimal(qty).add(base_tick ?? 0).mul(price).add(quote_tick ?? 0).toFixed(quote_dp);
      const str =
        calcNotional < notional
          ? `The order value should be greater or equal to ${newMinNotional} USDC`
          : undefined;
      return str;
    } catch (e) {
      return undefined;
    }
  }

  return undefined;
}
