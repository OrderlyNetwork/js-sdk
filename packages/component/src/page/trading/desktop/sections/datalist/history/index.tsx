import { HistoryListViewFull } from "@/block/orderHistory";
import { TradingPageContext } from "@/page/trading/context/tradingPageContext";
import { SymbolProvider } from "@/provider";
import { useOrderStream, useAccount } from "@orderly.network/hooks";
import {
  AccountStatusEnum,
  OrderSide,
  OrderStatus,
} from "@orderly.network/types";
import { useContext, useState } from "react";

export const HistoryView = () => {
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
    <HistoryListViewFull
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
