import { useModal } from "@/modal";
import { OrderEditForm } from "./editorForm";
import { API, OrderEntity } from "@orderly.network/types";
import { FC } from "react";
import { toast } from "@/toast";

interface Props {
  order: API.Order;
  editOrder: (values: OrderEntity) => Promise<any>;
  // editOrder: (orderId: string, order: OrderEntity) => Promise<any>;
}

export const OrderEditFormSheet: FC<Props> = (props) => {
  const { hide, resolve, reject } = useModal();
  if (!props.order) {
    return null;
  }

  const onEditSubmit = (values: OrderEntity) => {
    return props.editOrder(values).then((res: any) => {
      if (res.success) {
        toast.success("Order placed successfully");
        resolve(res);
        hide();
        // props.onComplete?.(res.data);
      }
    });
  };

  return (
    <OrderEditForm
      order={props.order}
      onSubmit={onEditSubmit}
      onCancel={function (): void {
        reject();
        hide();
      }}
    />
  );
};
