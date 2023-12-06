import { ListTile, ListView } from "@/listView";
import { Divider } from "@/divider";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Statistic } from "@/statistic";
import { SortDirection } from "@/block/markets/sections/sortItem";
import { SortCondition, SortGroup } from "@/block/markets/sections/sortGroup";
import { Numeral } from "@/text";
import { NumeralWithSymbol } from "@/text/numeralWithSymbol";
import { Cell } from "./cell";
import { SymbolProvider } from "@/provider";
import { API } from "@orderly.network/types";

interface MarketListViewProps {
  dataSource?: API.MarketInfo[];
  onItemClick?: (item: API.MarketInfo) => void;
}

const sortFunc = {
  vol:
    (direction: SortDirection) =>
      (a: API.MarketInfoExt, b: API.MarketInfoExt) => {
        return direction === SortDirection.DESC
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

export const MarketListView: FC<MarketListViewProps> = (props) => {
  const renderItem = useCallback((item: API.MarketInfoExt) => {
    return (
      <SymbolProvider symbol={item.symbol}>
        <Cell item={item} onItemClick={props.onItemClick} />
      </SymbolProvider>
    );
  }, []);
  const [sortCondition, setSortCondition] = useState<SortCondition>({});

  const renderSeparator = useCallback(() => {
    return <Divider className="orderly-my-[16px]" />;
  }, []);

  const dataSource = useMemo<API.MarketInfoExt[] | undefined>(() => {
    const newDataSource = props.dataSource?.map((item) => ({
      ...item,
      change: (item["24h_close"] - item["24h_open"]) / item["24h_open"],
    }));
    if (typeof sortCondition.key === "undefined") {
      return newDataSource;
    }

    return newDataSource?.sort(
      sortFunc[sortCondition.key](sortCondition.direction ?? SortDirection.ASC)
    );
  }, [props.dataSource, sortCondition]);

  const [innerHeight, setInnerHeight] = useState(window.innerHeight - 180);

  useEffect(() => {
    const handleResize = () => {
      setInnerHeight(window.innerHeight - 180);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  console.log("inner height", innerHeight);

  return (
    <>
      <SortGroup onChange={setSortCondition} />
      <Divider />
      <div className="orderly-overflow-y-auto orderly-overflow-hidden orderly-scrollbar-hidden orderly-hide-scrollbar orderly-h-[calc(100vh-180px)] orderly-my-2"
      style={{
        height: innerHeight
      }}>
        <ListView.separated<API.MarketInfoExt>
          dataSource={dataSource}
          renderItem={renderItem}
          renderSeparator={renderSeparator}
          contentClassName="orderly-space-y-[16px]"
          className="orderly-py-[16px]"
        />
      </div>
    </>
  );
};
