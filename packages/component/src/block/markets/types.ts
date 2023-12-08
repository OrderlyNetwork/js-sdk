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
