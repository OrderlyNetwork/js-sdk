import type { OrderlyAppProviderProps } from "@orderly.network/react-app";
import { AnnouncementType } from "@orderly.network/types";

export const dataAdapter: OrderlyAppProviderProps["dataAdapter"] = {
  // symbolList(original) {
  //   return original.filter(
  //     (item) =>
  //       item.symbol === "PERP_BTC_USDC" ||
  //       item.symbol === "PERP_ETH_USDC" ||
  //       item.symbol === "PERP_SOL_USDC",
  //   );
  // },
  // announcementList(data) {
  //   return [
  //     {
  //       announcement_id: "111",
  //       message:
  //         "DAWN OF DOMINANCE: $25,000 Trading Campaign is live Trading Campaign is live 111",
  //       url: "https://app.orderly.network/tradingRewards",
  //       type: AnnouncementType.Campaign,
  //       coverImage: "https://i.ibb.co/HY0QfQT/Image-12.webp",
  //       updated_time: new Date("2025-12-21"),
  //     },
  //     ...data,
  //   ];
  // },
};
