export const feeDecimalsOffset = (origin?: number): number => {
  return (origin ?? 2) + 3;
};

export const priceDecimalsOffset = (origin?: number): number => {
  return Math.abs((origin ?? 2) - 5);
};
