import { HistoryListView } from "@/block/orderHistory";
import { TradingPageContext } from "@/page/trading/context/tradingPageContext";
import { SymbolProvider } from "@/provider";
import { useOrderStream, useAccount } from "@orderly.network/hooks";
import {
  AccountStatusEnum,
  OrderSide,
  OrderStatus,
} from "@orderly.network/types";
import { useContext, useState } from "react";
import { useFormatOrderHistory } from "@/page/trading/shared/hooks/useFormatOrderHistory";

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

  const formattedData = useFormatOrderHistory(
    state.status < AccountStatusEnum.EnableTrading || !data ? [] : data
  );

  return (
    <HistoryListView
      isLoading={isLoading}
      dataSource={formattedData}
      onSideChange={setSide}
      onStatusChange={setStauts}
      onSymbolChange={onSymbolChange}
      side={side}
      status={status}
      loadMore={loadMore}
      onCancelAlgoOrder={() => {
        throw new Error("Not implemented");
      }}
      onCancelOrder={() => {
        throw new Error("Not implemented");
      }}
    />
  );
};
