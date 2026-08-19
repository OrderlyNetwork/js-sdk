import { Decimal } from "@orderly.network/utils";

const isValidAmount = (value: string | undefined): value is string => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0;
};

export const getQuoteTargetAmount = (
  estimatedValue: string | undefined,
  estimatedAmount: string | undefined,
  decimals: number | undefined,
) => {
  if (isValidAmount(estimatedValue)) {
    return estimatedValue;
  }
  if (
    isValidAmount(estimatedAmount) &&
    Number.isInteger(decimals) &&
    typeof decimals === "number" &&
    decimals >= 0
  ) {
    return new Decimal(estimatedAmount)
      .div(new Decimal(10).pow(decimals))
      .toString();
  }
  return "-";
};

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
