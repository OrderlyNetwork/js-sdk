import { useState } from "react";
import { useSymbolContext } from "../../../providers/symbolProvider";
import { usePositionsRowContext } from "../../desktop/positionRowContext";
import { PositionCellState } from "../positionCell/positionCell.script";
import { toast } from "@orderly.network/ui";

export const useMarketCloseBtnScript = (props: {
  state: PositionCellState;
}) => {
  const symbolInfo = useSymbolContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const {
    onSubmit,
    price,
    quantity,
    closeOrderData,
    submitting,
    type,
    updatePriceChange,
    updateOrderType,
    updateQuantity,
  } = usePositionsRowContext();

  const onConfirm = () => {
    return onSubmit().then(
      (res) => {
        setDialogOpen(false);
      },
      (error: any) => {
        if (typeof error === "string") {
          toast.error(error);
        } else {
          toast.error(error.message);
        }
      }
    );
  };

  const onClose = () => {
    setDialogOpen(false);
  };

  return {
    ...props,
    ...symbolInfo,

    dialogOpen,
    setDialogOpen,

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
