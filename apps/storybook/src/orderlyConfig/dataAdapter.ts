import type { OrderlyAppProviderProps } from "@orderly.network/react-app";

export const dataAdapter: OrderlyAppProviderProps["dataAdapter"] = {
  // symbolList(original) {
  //   return original.filter(
  //     (item) =>
  //       item.symbol === "PERP_SOL_USDC" ||
  //       item.symbol === "PERP_WOO_USDC" ||
  //       item.symbol === "PERP_ETH_USDC",
  //   );
  // },
  announcementList(data) {
    return [
      {
        announcement_id: "111",
        message:
          "DAWN OF DOMINANCE: $25,000 Trading Campaign is live Trading Campaign is live 111",
        url: "https://app.orderly.network/tradingRewards",
        type: "Campaign",
      },
      {
        announcement_id: "222",
        message:
          "DAWN OF DOMINANCE: $25,000 Trading Campaign is live Trading Campaign is live 222",
        url: "https://app.orderly.network/tradingRewards",
        type: "Campaign",
      },
      {
        announcement_id: "333",
        message:
          "DAWN OF DOMINANCE: $25,000 Trading Campaign is live Trading Campaign is live 333",
        url: "https://app.orderly.network/tradingRewards",
        type: "Campaign",
      },
      ...data,
    ];
  },
};
