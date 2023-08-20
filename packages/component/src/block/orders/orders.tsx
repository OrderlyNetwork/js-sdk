import { ListView } from "@/listView";
import { FC, useMemo, useState } from "react";
import { Divider } from "@/divider";
import { OrderCell } from "@/block/orders/cell";
import { Toolbar } from "./toolbar";
import { StatisticStyleProvider } from "@/statistic/defaultStaticStyle";

export interface OrdersViewProps {
  dataSource: any[];
  onCancelAll?: () => void;
  isLoading: boolean;
  onEditOrder?: (order: any) => void;
  onCancelOrder?: (order: any) => void;

  // onOnlyCurrentSymbolChange?: (value: boolean) => void;
  // only show current symbol's orders, default is true
  showAllSymbol?: boolean;
  onShowAllSymbolChange?: (value: boolean) => void;

  symbol: string;
}

export const OrdersView: FC<OrdersViewProps> = (props) => {
  return (
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
        renderItem={(item, index) => (
          <OrderCell
            order={item}
            onCancel={props.onCancelOrder}
            onEdit={props.onEditOrder}
          />
        )}
      ></ListView.separated>
    </StatisticStyleProvider>
  );
};
