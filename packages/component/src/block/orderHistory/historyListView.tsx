import { Divider } from "@/divider";
import { ListView } from "@/listView";
import { FC } from "react";
import { HistoryToolbar } from "./historyToolbar";
import { Cell } from "./cell";
import { StatisticStyleProvider } from "@/statistic/defaultStaticStyle";
import { OrderSide, OrderStatus } from "@orderly.network/types";
import { SymbolProvider } from "@/provider";
import { API } from "@orderly.network/types";

export interface OrderHistoryListViewProps {
  isLoading: boolean;
  dataSource: any[];
  side: OrderSide | "";
  status: OrderStatus | "";
  onSideChange?: (side: OrderSide) => void;
  onStatusChange?: (status: OrderStatus) => void;
  onSymbolChange?: (symbol: API.Symbol) => void;
  loadMore: () => void;
}

export const HistoryListView: FC<OrderHistoryListViewProps> = (props) => {
  return (
    <StatisticStyleProvider labelClassName={"text-3xs text-base-contrast/30"}>
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
  );
};
