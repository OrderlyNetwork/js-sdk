import { ListView } from "@/listView";
import { FC, useMemo, useState } from "react";
import { Divider } from "@/divider";
import { OrderCell } from "@/block/orders/cell";
import { Toolbar } from "./toolbar";
import { StatisticStyleProvider } from "@/statistic/defaultStaticStyle";
import { API, OrderEntity } from "@orderly.network/types";
import { OrderListContext, OrderListProvider } from "./orderListContext";

export interface OrdersViewProps {
  dataSource: any[];
  onCancelAll?: () => void;
  isLoading: boolean;
  cancelOrder: (orderId: number, symbol: string) => Promise<any>;
  editOrder: (orderId: string, order: OrderEntity) => Promise<any>;

  showAllSymbol?: boolean;
  onShowAllSymbolChange?: (value: boolean) => void;

  symbol: string;
}

export const OrdersView: FC<OrdersViewProps> = (props) => {
  return (
    <OrderListProvider
      cancelOrder={props.cancelOrder}
      editOrder={props.editOrder}
    >
      <StatisticStyleProvider labelClassName={"text-sm text-base-contrast/30"}>
        <Toolbar
          onCancelAll={props.onCancelAll}
          onShowAllSymbolChange={props.onShowAllSymbolChange}
          showAllSymbol={props.showAllSymbol}
        />
        <Divider />
        <ListView.separated
          isLoading={props.isLoading}
          dataSource={props.dataSource}
          renderSeparator={(_, index) => <Divider />}
          renderItem={(item, index) => <OrderCell order={item} />}
        />
      </StatisticStyleProvider>
    </OrderListProvider>
  );
};
