import { OrdersView } from "@/block/orders";
import { FC, useCallback, useContext } from "react";
import { useOrderStream, OrderStatus } from "@orderly.network/hooks";
import { TradingPageContext } from "@/page/trading/context/tradingPageContext";
import { API } from "@orderly.network/types";

interface Props {
  // symbol: string;
}

export const OrdersPane: FC<Props> = (props) => {
  const { symbol } = useContext(TradingPageContext);

  const [data, { isLoading }] = useOrderStream({
    status: OrderStatus.NEW,
    symbol: symbol,
  });

  const onCancelOrder = useCallback((order: API.Order) => {
    console.log("cancel order", order);
  }, []);

  return (
    <OrdersView
      dataSource={data}
      isLoading={isLoading}
      symbol={symbol}
      onCancelOrder={onCancelOrder}
    />
  );
};
