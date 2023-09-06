import { OrdersView } from "@/block/orders";
import { FC, useCallback, useContext, useState } from "react";
import {
  useOrderStream,
  OrderStatus,
  useAccount,
} from "@orderly.network/hooks";
import { TradingPageContext } from "@/page/trading/context/tradingPageContext";
import { API, AccountStatusEnum, OrderEntity } from "@orderly.network/types";

interface Props {
  // symbol: string;
}

export const OrdersPane: FC<Props> = (props) => {
  const context = useContext(TradingPageContext);

  const [symbol, setSymbol] = useState("");

  const [data, { isLoading, cancelOrder, updateOrder }] = useOrderStream({
    status: OrderStatus.NEW,
    symbol: symbol,
  });

  const onShowAllSymbolChange = (isAll: boolean) => {
    setSymbol(isAll ? "" : context.symbol);
  };

  const { state } = useAccount();

  const onCancelOrder = useCallback(
    (orderId: number, symbol: string): Promise<any> => {
      return cancelOrder(orderId, symbol);
    },
    []
  );

  return (
    <OrdersView
      dataSource={state.status < AccountStatusEnum.EnableTrading ? [] : data}
      isLoading={isLoading}
      symbol={context.symbol}
      showAllSymbol={symbol === ""}
      cancelOrder={onCancelOrder}
      onShowAllSymbolChange={onShowAllSymbolChange}
      editOrder={updateOrder}
    />
  );
};
