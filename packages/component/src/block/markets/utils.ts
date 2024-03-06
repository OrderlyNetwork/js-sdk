import { API } from "@orderly.network/types";
import { SortDirection } from "./shared/types";
import { Decimal } from "@orderly.network/utils";

export const sortFunc = {
  vol:
    (direction: SortDirection) =>
    (a: API.MarketInfoExt, b: API.MarketInfoExt) => {
      const aValue = a["24h_amount"];
      const bValue = b["24h_amount"];
      return direction === SortDirection.ASC
        ? aValue - bValue
        : bValue - aValue;
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
