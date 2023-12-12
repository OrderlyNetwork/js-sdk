import { OrderStatus, OrderSide } from "@orderly.network/types";
import { FC } from "react";
import { Listview } from "./listview";
import { Header } from "./header";
import { Divider } from "@/divider";
import { OrdersViewProps } from "../types";
import { OrderListProvider } from "../shared/orderListContext";

interface Props extends OrdersViewProps {
  status: OrderStatus;
  side: OrderSide;
  onSideChange: (side: OrderSide) => void;
}

export const OrdersViewFull: FC<Props> = (props) => {
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
      <Listview
        dataSource={props.dataSource}
        status={props.status}
        onCancelOrder={props.cancelOrder}
      />
    </OrderListProvider>
  );
};
