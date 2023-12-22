import { FC } from "react";
import { SearchForm } from "@/block/markets/sections/search";
import { MarketListView } from "@/block/markets/sections/listView";
import { type API } from "@orderly.network/types";
import { useDataSource } from "./useDataSource";
import { MarketsProps, SortDirection } from "./shared/types";

export const Markets: FC<MarketsProps & { listHeight?: number }> = (props) => {
  const [dataSource, { searchKey, onSearch, onSort }] = useDataSource(
    props.dataSource
  );

  return (
    <>
      <h3
        id="orderly-markets-sheet-title"
        className="orderly-text-lg orderly-text-base-contrast orderly-py-3"
      >
        Markets
      </h3>
      <SearchForm onChange={onSearch} value={searchKey} />
      <MarketListView
        dataSource={dataSource}
        onItemClick={props.onItemClick}
        onSort={onSort}
        listHeight={props.listHeight}
      />
    </>
  );
};
