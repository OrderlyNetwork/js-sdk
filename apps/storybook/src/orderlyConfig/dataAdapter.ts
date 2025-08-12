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
        announcement_id: "leaderboard",
        message: "DAWN OF DOMINANCE: $25,000 Trading Campaign is live!",
        url: "https://app.orderly.network/tradingRewards",
        type: "Campaign",
      },
      ...data,
    ];
  },
};
