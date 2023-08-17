import { ListView } from "@/listView";
import { Divider } from "@/divider";
import { FC, useCallback, useMemo, useState } from "react";
import { Statistic } from "@/statistic";
import { SortDirection } from "@/block/markets/sections/sortItem";
import { SortCondition, SortGroup } from "@/block/markets/sections/sortGroup";
import { API } from "@orderly/core";
import { Numeral } from "@/text";

interface MarketListViewProps {
  dataSource?: API.MarketInfo[];
  onItemClick?: (item: API.MarketInfo) => void;
}

type DataItem = API.MarketInfo & { change: number };

const sortFunc = {
  vol: (direction: SortDirection) => (a: DataItem, b: DataItem) => {
    return direction === SortDirection.ASC
      ? a["24h_volumn"] - b["24h_volumn"]
      : b["24h_volumn"] - a["24h_volumn"];
  },
  price: (direction: SortDirection) => (a: DataItem, b: DataItem) => {
    return direction === SortDirection.ASC
      ? a["24h_close"] - b["24h_close"]
      : b["24h_close"] - a["24h_close"];
  },
  change: (direction: SortDirection) => (a: DataItem, b: DataItem) => {
    return direction === SortDirection.ASC
      ? a.change - b.change
      : b.change - a.change;
  },
};

export const MarketListView: FC<MarketListViewProps> = (props) => {
  const renderItem = useCallback((item: DataItem) => {
    return (
      <ListView.listTile
        title={"BTC-PERP"}
        subtitle={item["24h_volumn"]}
        avatar={{
          type: "coin",
          name: "BTC",
        }}
        tailing={
          <Statistic
            label={<Numeral rule={"price"}>{item["24h_close"]}</Numeral>}
            value={item.change}
            rule={"percentages"}
            align={"right"}
            coloring
            valueClassName={"text-sm"}
          />
        }
        onClick={() => {
          props.onItemClick?.(item);
        }}
      />
    );
  }, []);
  const [sortCondition, setSortCondition] = useState<SortCondition>({});

  const renderSeparator = useCallback(() => {
    return <Divider />;
  }, []);

  const dataSource = useMemo<DataItem[] | undefined>(() => {
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

  return (
    <>
      <SortGroup onChange={setSortCondition} />
      <Divider />
      <ListView.separated<DataItem>
        dataSource={dataSource}
        renderItem={renderItem}
        renderSeparator={renderSeparator}
      />
    </>
  );
};
