import type { OrderlyAppProviderProps } from "@orderly.network/react-app";

export const dataAdapter: OrderlyAppProviderProps["dataAdapter"] = {
  announcementList(data) {
    return [...data];
  },
  // symbolList(original, { rwaSymbolsInfo }) {
  // return original.filter(
  //   (item) =>
  //     item.symbol === "PERP_BTC_USDC" ||
  //     item.symbol === "PERP_ETH_USDC" ||
  //     item.symbol === "PERP_SOL_USDC",
  // );
  // },
  // chainsList(chains) {
  //   return chains;
  // },
};
