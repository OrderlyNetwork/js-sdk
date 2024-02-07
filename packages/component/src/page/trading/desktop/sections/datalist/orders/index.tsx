import { OrdersView } from "@/block/orders";
import { FC, useCallback, useContext, useEffect, useState } from "react";
import {
  useOrderStream,
  useAccount,
  useSessionStorage,
} from "@orderly.network/hooks";
import { TradingPageContext } from "@/page/trading/context/tradingPageContext";
import { API, AccountStatusEnum, OrderEntity } from "@orderly.network/types";
import { TabContext } from "@/tab";
import { OrderStatus } from "@orderly.network/types";
import { OrdersViewFull } from "@/block/orders/full";
import { OrderSide } from "@orderly.network/types";
import { useTabContext } from "@/tab/tabContext";

interface Props {
  // symbol: string;
  status: OrderStatus;
}

export const MyOrders: FC<Props> = (props) => {
  const context = useContext(TradingPageContext);

  const { data: tabExtraData } = useTabContext();

  // const [symbol, setSymbol] = useState(() =>
  //   tabExtraData.showAllSymbol ? "" : context.symbol
  // );

  const [side, setSide] = useState<OrderSide | "">("");

  const [data, { isLoading, loadMore, cancelOrder, updateOrder, cancelAlgoOrder, updateAlgoOrder }] =
    useOrderStream({
      status: props.status,
      symbol: tabExtraData.showAllSymbol ? "" : context.symbol,
      // @ts-ignore
      side,
    });

  // const onShowAllSymbolChange = (isAll: boolean) => {
  //   setSymbol(isAll ? "" : context.symbol);
  //   setShowAllSymbol(isAll);
  // };

  const { state } = useAccount();

  const onCancelOrder = useCallback(
    (orderId: number | OrderEntity, symbol: string): Promise<any> => {
      // @ts-ignore
      return cancelOrder(orderId, symbol);
    },
    []
  );

  return (
    <OrdersViewFull
      // @ts-ignore
      dataSource={state.status < AccountStatusEnum.EnableTrading ? [] : data}
      isLoading={isLoading}
      symbol={context.symbol}
      onSideChange={setSide}
      // @ts-ignore
      side={side}
      showAllSymbol={tabExtraData.showAllSymbol}
      cancelOrder={onCancelOrder}
      editOrder={updateOrder}
      cancelAlgoOrder={cancelAlgoOrder}
      editAlgoOrder={updateAlgoOrder}
      onSymbolChange={context.onSymbolChange}
      loadMore={loadMore}
      status={props.status}
    />
  );
};
