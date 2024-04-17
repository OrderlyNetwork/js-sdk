import { Divider } from "@/divider";
import { FC, useContext } from "react";
import { OrderHistoryListViewProps } from "../shared/types";
import { Header } from "./header";
import { Listview } from "./listview";
import { TabContext } from "@/tab";
import { OrderListProvider } from "@/block/orders/shared/orderListContext";
import { OrderEntity } from "@orderly.network/types";

export const HistoryListViewFull: FC<OrderHistoryListViewProps> = (props) => {
  const { height } = useContext(TabContext);

  return (
    <div id="orderly-order-history-desktop">

      <OrderListProvider
        cancelOrder={props.onCancelOrder}
        editOrder={(orderId: string, order: OrderEntity): Promise<any> => {
          throw new Error("Function not implemented.");
        }}
        cancelAlgoOrder={(orderId: number, symbol: string): Promise<any> => {
          throw new Error("Function not implemented.");
        }}
        editAlgoOrder={(orderId: string, order: OrderEntity): Promise<any> => {
          throw new Error("Function not implemented.");
        }}
      >
        <Header
          status={props.status}
          side={props.side}
          onSideChange={props.onSideChange}
          onStatusChange={props.onStatusChange}
        />
        <Divider />
        <div
          className="orderly-relative"
          style={{
            height: `${(height?.content ?? 100) - 55}px`,
          }}
        >
          <Listview
            dataSource={props.dataSource}
            loading={props.isLoading}
            loadMore={props.loadMore}
            onSymbolChange={props.onSymbolChange}
          />
        </div>
      </OrderListProvider>
    </div>
  );
};
