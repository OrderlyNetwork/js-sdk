import { OrderStatus } from "@orderly.network/types";
import { FC } from "react";
import { Listview } from "./listview";
import { Header } from "./header";
import { OrdersViewProps } from "@/block";

interface Props extends OrdersViewProps {
  status: OrderStatus;
}

export const OrdersViewFull: FC<Props> = (props) => {
  return (
    <div>
      <Header />
      <Listview />
    </div>
  );
};
