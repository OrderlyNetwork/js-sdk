import { useMarkPricesStream } from "@orderly.network/hooks";
import { PositionCellState } from "../positionCell/positionCell.script";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSymbolContext } from "../../../providers/symbolProvider";
import { usePositionsRowContext } from "../../desktop/positionRowContext";
import { toast } from "@orderly.network/ui";
import { OrderType } from "@orderly.network/types";

export const useLimitCloseBtnScript = (props: { state: PositionCellState }) => {
  const { state } = props;
  const [open, setOpen] = useState(false);
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
  const setPrice = useRef(false);

  const [sliderValue, setSliderValue] = useState(100);

  const onConfirm = () => {
    return onSubmit().then(
      (res) => {
        setOpen(false);
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
    setOpen(false);
  };
  const prices = useMarkPricesStream();
  const curMarkPrice = useMemo(() => {
    return prices?.["data"]?.[state.item.symbol] ?? "--";
  }, [prices]);

  const { quote_dp, base_dp, base, quote } = useSymbolContext();
  useEffect(() => {
    if (!setPrice.current && curMarkPrice && open) {
      setPrice.current = true;
      updateOrderType(OrderType.LIMIT, `${curMarkPrice}`);
    }
  }, [setPrice, curMarkPrice, open]);

  // clear state
  useEffect(() => {
    if (!open) {
        console.log("clear state");
        updateOrderType(OrderType.MARKET);
      setPrice.current = false;
    }
  }, [open]);

  return {
    ...state,
    open,
    setOpen,
    curMarkPrice,
    quote_dp,
    base_dp,
    base,
    quote,

    onClose,
    onConfirm,
    price,
    quantity,
    closeOrderData,
    submitting,
    updatePriceChange,
    updateQuantity,

    // slider
    sliderValue, setSliderValue,
  };
};

export type LimitCloseBtnState = ReturnType<typeof useLimitCloseBtnScript>;
