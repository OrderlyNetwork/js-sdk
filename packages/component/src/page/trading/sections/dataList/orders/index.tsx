import { OrdersView } from "@/block/orders";
import { FC, useCallback, useContext } from "react";
import {
  useOrderStream,
  OrderStatus,
  useAccount,
} from "@orderly.network/hooks";
import { TradingPageContext } from "@/page/trading/context/tradingPageContext";
import { API, AccountStatusEnum } from "@orderly.network/types";

interface Props {
  // symbol: string;
}

export const OrdersPane: FC<Props> = (props) => {
  const { symbol } = useContext(TradingPageContext);

  const [data, { isLoading }] = useOrderStream({
    status: OrderStatus.NEW,
    symbol: symbol,
  });

  const { state } = useAccount();

  const onCancelOrder = useCallback((order: API.Order) => {
    console.log("cancel order", order);
  }, []);

  return (
    <OrdersView
      dataSource={state.status < AccountStatusEnum.EnableTrading ? [] : data}
      isLoading={isLoading}
      symbol={symbol}
      onCancelOrder={onCancelOrder}
    />
  );
};
