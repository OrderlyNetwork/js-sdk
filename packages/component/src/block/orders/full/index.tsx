import { OrderStatus, OrderSide } from "@orderly.network/types";
import { FC } from "react";
import { Listview } from "./listview";
import { Header } from "./header";
import { Divider } from "@/divider";
import { OrdersViewProps } from "../types";

interface Props extends OrdersViewProps {
  status: OrderStatus;
  onSideChange: (side: OrderSide) => void;
}

export const OrdersViewFull: FC<Props> = (props) => {
  return (
    <>
      <Header
        count={props.dataSource?.length ?? 0}
        onSideChange={props.onSideChange}
      />
      <Divider />
      <Listview
        dataSource={props.dataSource}
        status={props.status}
        onCancelOrder={props.cancelOrder}
      />
    </>
  );
};
