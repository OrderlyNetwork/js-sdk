import { Column } from "@orderly.network/ui";
import type { FavoriteInstance } from "../../type";
import {
  get24hVolOIColumn,
  getLastAnd24hPercentageColumn,
  getSymbolColumn,
} from "../shared/column";

export const useSideMarketsColumns = (
  favorite: FavoriteInstance,
  isFavoriteList = false,
) => {
  const symbolCol = getSymbolColumn(favorite, isFavoriteList, {
    stackLeverageInSecondRow: true,
  });
  const volOiCol = get24hVolOIColumn();
  const lastPctCol = getLastAnd24hPercentageColumn(favorite, isFavoriteList);

  return [
    {
      ...symbolCol,
      width: 115,
    },
    volOiCol,
    lastPctCol,
  ] as Column[];
};
