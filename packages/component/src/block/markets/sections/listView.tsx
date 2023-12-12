import { ListTile, ListView } from "@/listView";
import { Divider } from "@/divider";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Statistic } from "@/statistic";
import { SortCondition, SortGroup } from "@/block/markets/sections/sortGroup";
import { Numeral } from "@/text";
import { NumeralWithSymbol } from "@/text/numeralWithSymbol";
import { Cell } from "./cell";
import { SymbolProvider } from "@/provider";
import { API } from "@orderly.network/types";
import { MarketListViewProps, SortDirection, SortKey } from "../shared/types";
import { sortFunc } from "../utils";

interface Props {
  onSort: (value: Partial<{ key: SortKey; direction: SortDirection }>) => void;
}

export const MarketListView: FC<MarketListViewProps & Props> = (props) => {
  const renderItem = useCallback((item: API.MarketInfoExt) => {
    return (
      <SymbolProvider symbol={item.symbol}>
        <Cell item={item} onItemClick={props.onItemClick} />
      </SymbolProvider>
    );
  }, []);

  const renderSeparator = useCallback(() => {
    return <Divider className="orderly-my-[16px]" />;
  }, []);

  const [innerHeight, setInnerHeight] = useState(window.innerHeight - 180);

  useEffect(() => {
    const handleResize = () => {
      setInnerHeight(window.innerHeight - 180);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <SortGroup onChange={props.onSort} />
      <Divider />
      <div
        className="orderly-overflow-y-auto orderly-overflow-hidden orderly-scrollbar-hidden orderly-hide-scrollbar orderly-h-[calc(100vh-180px)] orderly-my-2"
        style={{
          height: innerHeight,
        }}
      >
        <ListView.separated<API.MarketInfoExt>
          dataSource={props.dataSource}
          renderItem={renderItem}
          renderSeparator={renderSeparator}
          contentClassName="orderly-space-y-[16px]"
          className="orderly-py-[16px]"
        />
      </div>
    </>
  );
};
