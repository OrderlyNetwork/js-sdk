import { ListView } from "@/listView";
import { FC } from "react";
import { Divider } from "@/divider";
import { OrderCell } from "@/block/orders/cell";
import { Toolbar } from "./toolbar";

export interface OrdersViewProps {
  dataSource: any[];
  onCancelAll?: () => void;
  isLoading: boolean;
  onEditOrder?: (order: any) => void;
  onCancelOrder?: (order: any) => void;
}

export const OrdersView: FC<OrdersViewProps> = (props) => {
  return (
    <>
      <Toolbar onCancelAll={props.onCancelAll} />
      <Divider />
      <ListView.separated
        isLoading={props.isLoading}
        dataSource={props.dataSource}
        renderSeparator={(_, index) => <Divider />}
        renderItem={(item, index) => (
          <OrderCell
            order={item}
            onCancel={props.onCancelOrder}
            onEdit={props.onEditOrder}
          />
        )}
      ></ListView.separated>
    </>
  );
};
