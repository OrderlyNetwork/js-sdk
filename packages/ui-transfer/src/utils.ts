import { API } from "@orderly.network/types";

export function formatAddress(address?: string) {
  if (!address) return "--";
  return address.replace(/^(.{6})(.*)(.{4})$/, "$1......$3");
}

export const getTokenByTokenList = (tokens: API.TokenInfo[] = []) => {
  const tokenObj = tokens.reduce((acc, item) => {
    acc[item.symbol] = item;
    return acc;
  }, {} as any);

  return tokenObj["USDC"] || tokenObj["USDbC"] || tokens[0];
};

export const feeDecimalsOffset = (origin?: number): number => {
  return (origin ?? 2) + 3;
};

// export const priceDecimalsOffset = (origin?: number): number => {
//   return Math.abs((origin ?? 2) - 5);
// };
