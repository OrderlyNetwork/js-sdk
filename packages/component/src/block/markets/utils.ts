import { API } from "@orderly.network/types";
import { SortDirection } from "./types";

export const sortFunc = {
  vol:
    (direction: SortDirection) =>
    (a: API.MarketInfoExt, b: API.MarketInfoExt) => {
      return direction === SortDirection.ASC
        ? a["24h_volumn"] - b["24h_volumn"]
        : b["24h_volumn"] - a["24h_volumn"];
    },
  price:
    (direction: SortDirection) =>
    (a: API.MarketInfoExt, b: API.MarketInfoExt) => {
      return direction === SortDirection.ASC
        ? a["24h_close"] - b["24h_close"]
        : b["24h_close"] - a["24h_close"];
    },
  change:
    (direction: SortDirection) =>
    (a: API.MarketInfoExt, b: API.MarketInfoExt) => {
      return direction === SortDirection.ASC
        ? a.change - b.change
        : b.change - a.change;
    },
};
