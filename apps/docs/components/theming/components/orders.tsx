import { useDemoContext } from "@/components/demoContext";
import { useOrderStream } from "@orderly.network/hooks";
import { OrdersView } from "@orderly.network/react";
import { OrderEntity, OrderStatus } from "@orderly.network/types";
import { useState } from "react";

export const Orders = () => {
  const { symbol: globalSymbol } = useDemoContext();
  const [symbol, setSymbol] = useState(globalSymbol);
  const [data, { isLoading }] = useOrderStream({
    status: OrderStatus.COMPLETED,
    symbol: symbol,
  });
  //
  return (
    <OrdersView
      dataSource={data || []}
      isLoading={isLoading}
      onCancelAll={() => {}}
      onSymbolChange={(value) => {}}
      onShowAllSymbolChange={(value) => {
        if (value) {
          setSymbol("");
        } else {
          setSymbol(globalSymbol);
        }
      }}
      showAllSymbol={!symbol}
      symbol={symbol}
      cancelOrder={function (orderId: number, symbol: string): Promise<any> {
        // throw new Error("Function not implemented.");
        return Promise.resolve();
      }}
      editOrder={function (orderId: string, order: OrderEntity): Promise<any> {
        // throw new Error("Function not implemented.");
        return Promise.resolve();
      }}
      loadMore={function (): void {
        // throw new Error("Function not implemented.");
      }}
    />
  );
};
