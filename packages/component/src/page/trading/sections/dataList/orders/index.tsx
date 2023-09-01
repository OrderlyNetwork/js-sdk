import { OrdersView } from "@/block/orders";
import { FC, useContext } from "react";
import { useOrderStream, OrderStatus } from "@orderly.network/hooks";
import { TradingPageContext } from "@/page/trading/context/tradingPageContext";

interface Props {
  // symbol: string;
}

export const OrdersPane: FC<Props> = (props) => {
  const { symbol } = useContext(TradingPageContext);

  const [data, { isLoading }] = useOrderStream({
    status: OrderStatus.NEW,
    symbol: symbol,
  });
  return <OrdersView dataSource={data} isLoading={isLoading} symbol={symbol} />;
};
