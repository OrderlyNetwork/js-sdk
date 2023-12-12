import { FC } from "react";
import { SearchForm } from "@/block/markets/sections/search";
import { MarketListView } from "@/block/markets/sections/listView";
import { type API } from "@orderly.network/types";
import { useDataSource } from "./useDataSource";
import { SortDirection } from "./types";

export interface MarketsProps {
  dataSource?: API.MarketInfoExt[];
  onSortBy?: (key: string, direction: SortDirection) => void;
  onItemClick?: (item: API.MarketInfoExt) => void;

  className?: string;
}

export const Markets: FC<MarketsProps> = (props) => {
  const [dataSource, { searchKey, onSearch, onSort }] = useDataSource(
    props.dataSource
  );

  return (
    <>
      <h3 className="orderly-text-lg orderly-text-base-contrast orderly-py-3">Markets</h3>
      <SearchForm onChange={onSearch} value={searchKey} />
      <MarketListView
        dataSource={dataSource}
        onItemClick={props.onItemClick}
        onSort={onSort}
      />

    </>
  );
};
