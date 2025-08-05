import { OrderlyAppProviderProps } from "@orderly.network/react-app";

export const dataAdapter: OrderlyAppProviderProps["dataAdapter"] = {
  symbolList(original) {
    return original.filter(
      (item) =>
        item.symbol === "PERP_SOL_USDC" ||
        item.symbol === "PERP_WOO_USDC" ||
        item.symbol === "PERP_ETH_USDC",
    );
  },
};
