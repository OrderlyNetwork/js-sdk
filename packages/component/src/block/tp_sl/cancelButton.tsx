import Button from "@/button";
import { toast } from "@/toast";
import type { API } from "@orderly.network/types";
import { useState, type FC, useContext } from "react";
import { useTPSLOrderRowContext } from "@/block/tp_sl/tpslOrderRowContext";
import { OrderCancelButton } from "@/block/commons/orderCancelButton";

interface CancelButtonProps {
  // order: API.AlgoOrderExt;
}

export const CancelButton: FC<CancelButtonProps> = (props) => {
  const { onCancelOrder, order } = useTPSLOrderRowContext();

  return (
    <OrderCancelButton<API.AlgoOrderExt>
      order={order}
      onCancelOrder={onCancelOrder}
    />
  );
};
