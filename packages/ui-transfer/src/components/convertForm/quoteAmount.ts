import { Decimal } from "@orderly.network/utils";

// The quote target is fixed to USDC, so estimatedValue is the display amount.
export const calculateQuoteRate = (
  inputAmount: number,
  estimatedUsdcValue: string,
) => new Decimal(estimatedUsdcValue).div(inputAmount).toString();

export const calculateMinimumReceived = (
  estimatedUsdcValue: string,
  slippageLimitPercent: string,
) =>
  new Decimal(estimatedUsdcValue)
    .mul(new Decimal(1).minus(new Decimal(slippageLimitPercent).div(100)))
    .toString();
