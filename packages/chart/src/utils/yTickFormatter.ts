import { numberToHumanStyle } from "@veltodefi/utils";

export const tickFormatter = (value: number) => {
  const absValue = Math.abs(value);
  const dp = absValue === 0 ? 0 : absValue <= 10 ? 2 : absValue <= 100 ? 1 : 0;
  const formatted = numberToHumanStyle(absValue, dp);
  return value < 0 ? `-${formatted}` : formatted;
};
