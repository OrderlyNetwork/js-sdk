import { Decimal } from "@orderly.network/utils";

/** Display the account's curve coefficient, rather than an effective fill rate. */
export function formatBinaryFeeBps(bps: number | undefined): string {
  return bps == null || !Number.isFinite(bps) || bps < 0
    ? "--%"
    : `${new Decimal(bps).div(100).toFixed(2, Decimal.ROUND_HALF_UP)}%`;
}
