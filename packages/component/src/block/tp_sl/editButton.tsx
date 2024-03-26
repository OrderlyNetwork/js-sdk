import { FC, useEffect } from "react";
import { TPSLOrderEditButton } from "@/block/commons/tpslOrderEditButton";
import { useTPSLOrderRowContext } from "@/block/tp_sl/tpslOrderRowContext";

export const EditButton: FC<{}> = (props) => {
  const { order, position } = useTPSLOrderRowContext();

  return (
    <TPSLOrderEditButton
      disabled={!position}
      onSubmit={() => {}}
      label={"Edit"}
      order={order}
      position={position}
      maxQty={position?.position_qty}
      isEditing
    />
  );
};
