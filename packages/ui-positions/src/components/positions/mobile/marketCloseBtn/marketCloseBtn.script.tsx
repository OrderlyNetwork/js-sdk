import { useState } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import { useSymbolContext } from "../../../../providers/symbolProvider";
import { usePositionsRowContext } from "../../desktop/positionRowContext";
import { PositionCellState } from "../positionCell/positionCell.script";

export const useMarketCloseBtnScript = (props: {
  state: PositionCellState;
}) => {
  const symbolInfo = useSymbolContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { onSubmit, quantity, submitting, updateOrderType, updateQuantity } =
    usePositionsRowContext();

  const [orderConfirm] = useLocalStorage("orderly_order_confirm", true);

  const onConfirm = () => {
    return onSubmit().then((res) => {
      setDialogOpen(false);
    });
  };

  const onClose = () => {
    setDialogOpen(false);
  };

  return {
    ...props,
    ...symbolInfo,

    dialogOpen,
    setDialogOpen,

    orderConfirm,

    onSubmit,
    quantity,
    onClose,
    onConfirm,
    submitting,
    updateOrderType,
    updateQuantity,
  };
};

export type MarketCloseBtnState = ReturnType<typeof useMarketCloseBtnScript>;
