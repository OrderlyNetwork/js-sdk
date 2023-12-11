import { OrderStatus } from "@orderly.network/types";
import { FC } from "react";
import { Listview } from "./listview";
import { Header } from "./header";
import { Divider } from "@/divider";
import { OrdersViewProps } from "../types";

interface Props extends OrdersViewProps {
  status: OrderStatus;
}

export const OrdersViewFull: FC<Props> = (props) => {
  return (
    <div>
      <Header count={props.dataSource?.length ?? 0} />
      <Divider />
      <Listview
        dataSource={props.dataSource}
        status={props.status}
        onCancelOrder={props.cancelOrder}
      />
    </div>
  );
};
