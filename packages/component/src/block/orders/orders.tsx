import React, { FC, useMemo, useState } from "react";
import { ListView } from "@/listView";
import { Divider } from "@/divider";
import { OrderCell } from "@/block/orders/cell";
import { Toolbar } from "./toolbar";
import { StatisticStyleProvider } from "@/statistic/defaultStaticStyle";
import { API, OrderEntity } from "@orderly.network/types";
import { OrderListContext, OrderListProvider } from "./shared/orderListContext";
import { SymbolProvider } from "@/provider";
import { OrdersViewProps } from "./types";
import { TPSLOrderRowProvider } from "../tp_sl/tpslOrderRowContext";

export const OrdersView: FC<OrdersViewProps> = (props) => {
  return (
    <OrderListProvider
      cancelOrder={props.cancelOrder}
      editOrder={props.editOrder}
      cancelAlgoOrder={props.cancelAlgoOrder}
      editAlgoOrder={props.editAlgoOrder}
    >
      <StatisticStyleProvider labelClassName="orderly-text-3xs orderly-text-base-contrast/30">
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
            <SymbolProvider symbol={item.symbol}>
              <TPSLOrderRowProvider order={item}>
                <OrderCell order={item} onSymbolChange={props.onSymbolChange} />
              </TPSLOrderRowProvider>
            </SymbolProvider>
          )}
          loadMore={props.loadMore}
        />
      </StatisticStyleProvider>
    </OrderListProvider>
  );
};
