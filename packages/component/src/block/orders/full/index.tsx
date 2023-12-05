import { OrderStatus } from "@orderly.network/types";
import { FC } from "react";
import { Listview } from "./listview";
import { Header } from "./header";
import { OrdersViewProps } from "@/block";
import { Divider } from "@/divider";

interface Props extends OrdersViewProps {
  status: OrderStatus;
}

export const OrdersViewFull: FC<Props> = (props) => {
  return (
    <div>
      <Header count={props.dataSource?.length ?? 0} />
      <Divider />
      <Listview dataSource={props.dataSource} status={OrderStatus.INCOMPLETE} />
    </div>
  );
};
