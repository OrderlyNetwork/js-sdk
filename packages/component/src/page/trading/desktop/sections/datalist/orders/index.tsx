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

interface Props {
  // symbol: string;
  status: OrderStatus;
}

export const MyOrders: FC<Props> = (props) => {
  const context = useContext(TradingPageContext);

  const [showAllSymbol, setShowAllSymbol] = useSessionStorage(
    "showAllSymbol_orders",
    true
  );

  const [symbol, setSymbol] = useState(() =>
    showAllSymbol ? "" : context.symbol
  );

  const [side, setSide] = useState<OrderSide | "">("");

  const [data, { isLoading, loadMore, cancelOrder, updateOrder }] =
    useOrderStream({
      status: props.status,
      symbol: symbol,
      // @ts-ignore
      side,
    });

  const onShowAllSymbolChange = (isAll: boolean) => {
    setSymbol(isAll ? "" : context.symbol);
    setShowAllSymbol(isAll);
  };

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
      showAllSymbol={showAllSymbol}
      cancelOrder={onCancelOrder}
      onShowAllSymbolChange={onShowAllSymbolChange}
      editOrder={updateOrder}
      onSymbolChange={context.onSymbolChange}
      loadMore={loadMore}
      status={props.status}
    />
  );
};
