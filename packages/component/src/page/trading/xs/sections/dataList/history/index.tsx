import { HistoryListView } from "@/block/orderHistory";
import { TradingPageContext } from "@/page/trading";
import { SymbolProvider } from "@/provider";
import { useOrderStream, useAccount } from "@orderly.network/hooks";
import {
  AccountStatusEnum,
  OrderSide,
  OrderStatus,
} from "@orderly.network/types";
import { useContext, useState } from "react";

export const HistoryPane = () => {
  const [side, setSide] = useState<OrderSide | "">("");
  const [status, setStauts] = useState<OrderStatus | "">("");
  const { state } = useAccount();
  const { onSymbolChange } = useContext(TradingPageContext);
  const [data, { isLoading, loadMore }] = useOrderStream({
    // @ts-ignore
    side,
    // @ts-ignore
    status,
  });

  return (
    <HistoryListView
      isLoading={isLoading}
      // @ts-ignore
      dataSource={state.status < AccountStatusEnum.EnableTrading ? [] : data}
      onSideChange={setSide}
      onStatusChange={setStauts}
      onSymbolChange={onSymbolChange}
      side={side}
      status={status}
      loadMore={loadMore}
    />
  );
};
