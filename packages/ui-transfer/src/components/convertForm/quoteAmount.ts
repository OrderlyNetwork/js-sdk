import { Decimal } from "@orderly.network/utils";

/**
 * Quote amounts use the logical token precision from /v1/public/token.
 * `chain_details` describes network metadata and must not override this
 * precision for the provider-neutral quote response.
 */
export const getQuoteTokenDecimals = (token?: {
  decimals?: number;
  chain_details?: unknown;
}) => token?.decimals ?? 6;

export const toRawQuoteAmount = (amount: number, decimals: number) =>
  new Decimal(amount).mul(new Decimal(10).pow(decimals)).toFixed(0);

export const unnormalizeAmount = (amount: string, decimals: number) =>
  new Decimal(amount).div(new Decimal(10).pow(decimals)).toString();

export const calculateQuoteRate = (
  inputAmount: string,
  outputAmount: string,
  sourceDecimals: number,
  targetDecimals: number,
) =>
  new Decimal(unnormalizeAmount(outputAmount, targetDecimals))
    .div(unnormalizeAmount(inputAmount, sourceDecimals))
    .toString();

export const calculateMinimumReceived = (
  estimatedAmount: string,
  slippageLimitPercent: string,
) =>
  new Decimal(estimatedAmount)
    .mul(new Decimal(1).minus(new Decimal(slippageLimitPercent).div(100)))
    .toString();
