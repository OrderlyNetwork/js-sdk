import { Decimal } from "@orderly.network/utils";

export function checkNotional(
  price?: string | number,
  qty?: string | number,
  minNotional?: number
): string | undefined {
  if (price !== undefined && qty !== undefined && minNotional !== undefined) {
    try {
      const calcNotional = new Decimal(price).mul(new Decimal(qty)).toNumber();
      const notional = Number.parseFloat(`${minNotional}`);

      const str =
        calcNotional < notional
          ? `The order value should be greater or equal to ${minNotional} USDC`
          : undefined;
      return str;
    } catch (e) {
      return undefined;
    }
  }

  return undefined;
}
