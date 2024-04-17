import { Divider } from "@/divider";
import { ListView } from "@/listView";
import { FC } from "react";
import { HistoryToolbar } from "./historyToolbar";
import { Cell } from "./cell";
import { StatisticStyleProvider } from "@/statistic/defaultStaticStyle";
import { OrderSide, OrderStatus } from "@orderly.network/types";
import { SymbolProvider } from "@/provider";
import { API } from "@orderly.network/types";
import { OrderHistoryListViewProps } from "./shared/types";

export const HistoryListView: FC<OrderHistoryListViewProps> = (props) => {
  return (
    <div id="orderly-order-history-mobile">
      <StatisticStyleProvider labelClassName="orderly-text-3xs orderly-text-base-contrast/30">
        <HistoryToolbar
          status={props.status}
          side={props.side}
          onSideChange={props.onSideChange}
          onStatusChange={props.onStatusChange}
        />
        <Divider />
        <ListView.separated
          isLoading={props.isLoading}
          dataSource={props.dataSource}
          renderSeparator={(_, index) => <Divider />}
          renderItem={(item, index) => (
            <SymbolProvider symbol={item.symbol}>
              <Cell item={item} onSymbolChange={props.onSymbolChange} />
            </SymbolProvider>
          )}
          loadMore={props.loadMore}
        />
      </StatisticStyleProvider>
    </div>
  );
};
