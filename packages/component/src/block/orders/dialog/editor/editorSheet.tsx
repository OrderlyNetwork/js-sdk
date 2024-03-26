import { FC } from "react";
import { useModal } from "@/modal";
import { OrderEditForm } from "./editorForm";
import { API, OrderEntity } from "@orderly.network/types";
import { AlgoOrderRootType } from "@orderly.network/types";
import { TPSLSheet } from "@/block/tp_sl/tpslSheet";
import { useTPSLOrderRowContext } from "@/block/tp_sl/tpslOrderRowContext";

interface Props {
  order: API.Order | API.AlgoOrder;
  position?: API.Position;
  editOrder: (values: OrderEntity) => Promise<any>;
}

export const OrderEditFormSheet: FC<Props> = (props) => {
  const { hide, resolve, reject } = useModal();
  // const { order, position } = useTPSLOrderRowContext();

  if (!props.order) {
    return null;
  }

  const onEditSubmit = (values: OrderEntity) => {
    return props.editOrder(values).then((res: any) => {
      if (res.success) {
        // toast.success("Order placed successfully");
        resolve(res);
        hide();
        // props.onComplete?.(res.data);
      }
    });
  };

  if (
    "algo_type" in props.order &&
    props.order.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL
  ) {
    if (!props.position) {
      return null;
    }
    return <TPSLSheet order={props.order} position={props.position} />;
  }

  return (
    <OrderEditForm
      order={props.order as API.Order}
      onSubmit={onEditSubmit}
      onCancel={function (): void {
        reject();
        hide();
      }}
    />
  );
};
