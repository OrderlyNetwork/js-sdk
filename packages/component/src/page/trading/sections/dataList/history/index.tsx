import { HistoryListView } from "@/block/orderHistory";
import { TradingPageContext } from "@/page/trading";
import { SymbolProvider } from "@/provider";
import { useOrderStream } from "@orderly.network/hooks";
import { OrderSide, OrderStatus } from "@orderly.network/types";
import { useContext, useState } from "react";

export const HistoryPane = () => {
  const [side, setSide] = useState<OrderSide | "">("");
  const [status, setStauts] = useState<OrderStatus | "">("");
  // const { symbol } = useContext(TradingPageContext);
  const [data, { isLoading }] = useOrderStream({
    size: 20,
    side,
    status,
  });

  return (
    <HistoryListView
      isLoading={isLoading}
      dataSource={data}
      onSideChange={setSide}
      onStatusChange={setStauts}
      side={side}
      status={status}
    />
  );
};
