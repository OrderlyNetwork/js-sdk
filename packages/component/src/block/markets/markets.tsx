import { FC, useMemo, useState } from "react";
import { SearchForm } from "@/block/markets/sections/search";
import { MarketListView } from "@/block/markets/sections/listView";
import { SortDirection } from "@/block/markets/sections/sortItem";
import { type API } from "@orderly.network/types";

export interface MarketsProps {
  dataSource?: API.MarketInfo[];
  onSortBy?: (key: string, direction: SortDirection) => void;
  onItemClick?: (item: API.MarketInfo) => void;

  className?: string;
}

export const Markets: FC<MarketsProps> = (props) => {
  const [searchKey, setSearchKey] = useState<string>("");

  const dataSource = useMemo(() => {
    if (searchKey) {
      return props.dataSource?.filter((item) =>
        new RegExp(searchKey, "i").test(item.symbol)
      );
    }
    return props.dataSource;
  }, [props.dataSource, searchKey]);

  return (
    <>
      <h3 className={"text-lg text-base-contrast py-3"}>Markets</h3>
      <SearchForm onChange={setSearchKey} value={searchKey} />
      <MarketListView dataSource={dataSource} onItemClick={props.onItemClick} />
    </>
  );
};
