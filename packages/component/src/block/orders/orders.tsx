import { ListView } from "@/listView";
import { FC } from "react";
import { Divider } from "@/divider";
import { OrderCell } from "@/block/orders/cell";
import { Toolbar } from "./toolbar";

export interface OrdersViewProps {
  dataSource: any[];
  onCancelAll?: () => void;
}

export const OrdersView: FC<OrdersViewProps> = (props) => {
  return (
    <>
      <Toolbar onCancelAll={props.onCancelAll} />
      <Divider />
      <ListView.separated
        dataSource={props.dataSource}
        renderSeparator={(_, index) => <Divider />}
        renderItem={(item, index) => <OrderCell />}
      ></ListView.separated>
    </>
  );
};
