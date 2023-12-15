import { OrderStatus, OrderSide } from "@orderly.network/types";
import { FC, useContext } from "react";
import { Listview } from "./listview";
import { Header } from "./header";
import { Divider } from "@/divider";
import { OrdersViewProps } from "../types";
import { OrderListProvider } from "../shared/orderListContext";
import { TabContext } from "@/tab";

interface Props extends OrdersViewProps {
  status: OrderStatus;
  side: OrderSide;
  onSideChange: (side: OrderSide) => void;
}

export const OrdersViewFull: FC<Props> = (props) => {
  const { height } = useContext(TabContext);
  return (
    <OrderListProvider
      cancelOrder={props.cancelOrder}
      editOrder={props.editOrder}
    >
      <Header
        count={props.dataSource?.length ?? 0}
        onSideChange={props.onSideChange}
        side={props.side}
      />
      <Divider />
      <div
        className="orderly-overflow-y-auto"
        style={{ height: `${(height?.content ?? 100) - 55}px` }}
      >
        <Listview
          dataSource={props.dataSource}
          status={props.status}
          onCancelOrder={props.cancelOrder}
        />
      </div>
    </OrderListProvider>
  );
};
