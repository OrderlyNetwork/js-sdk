import { API } from "@orderly.network/types";

export type SortKey = "vol" | "price" | "change";

export interface MarketListViewProps {
  dataSource?: API.MarketInfoExt[];
  onItemClick?: (item: API.MarketInfoExt) => void;
}

export type SortCondition = Partial<{ key: SortKey; direction: SortDirection }>;

export enum SortDirection {
  NONE,
  ASC,
  DESC,
}

export function parseSortDirection(direction: number | string, ): SortDirection | undefined {
  const value = parseInt(direction.toString());
  switch(value) {
    case 0: return SortDirection.NONE;
    case 1: return SortDirection.ASC;
    case 2: return SortDirection.NONE;
    default: return undefined;
  }
}

export interface MarketsProps {
  dataSource?: API.MarketInfoExt[];
  // onSortBy?: (key: string, direction: SortDirection) => void;
  onItemClick?: (item: API.MarketInfoExt) => void;

  className?: string;
}
