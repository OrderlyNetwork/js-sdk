import { useLocalStorage, useMarkPricesStream } from "@orderly.network/hooks";
import { PositionCellState } from "../positionCell/positionCell.script";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSymbolContext } from "../../../providers/symbolProvider";
import { usePositionsRowContext } from "../../desktop/positionRowContext";
import { toast } from "@orderly.network/ui";
import { OrderType } from "@orderly.network/types";

export const useLimitCloseBtnScript = (props: { state: PositionCellState }) => {
  const { state } = props;
  const [sheetOpen, setSheetOpen] = useState(false);
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
    errors,
    baseTick,
  } = usePositionsRowContext();
  const setPrice = useRef(false);

  const [sliderValue, setSliderValue] = useState(100);


  const [orderConfirm ] = useLocalStorage("orderly_order_confirm", true);


  const onConfirm = () => {
    return onSubmit().then(
      (res) => {
        setSheetOpen(false);
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
    setSheetOpen(false);
  };
  const onCloseDialog = () => {
    setDialogOpen(false);
  };
  const prices = useMarkPricesStream();
  const curMarkPrice = useMemo(() => {
    return prices?.["data"]?.[state.item.symbol] ?? "--";
  }, [prices]);

  const { quote_dp, base_dp, base, quote } = useSymbolContext();
  useEffect(() => {
    if (!setPrice.current && curMarkPrice && sheetOpen) {
      setPrice.current = true;
      updateOrderType(OrderType.LIMIT, `${curMarkPrice}`);
    }
  }, [setPrice, curMarkPrice, sheetOpen]);

  // clear state
  useEffect(() => {
    if (!sheetOpen) {
      updateOrderType(OrderType.MARKET);
      setPrice.current = false;
      // setSliderValue(100);
    }
  }, [sheetOpen]);

  return {
    ...state,
    sheetOpen,
    setSheetOpen,
    curMarkPrice,
    quote_dp,
    base_dp,
    base,
    quote,
    baseTick,

    orderConfirm,

    onClose,
    onConfirm,
    price,
    quantity,
    closeOrderData,
    submitting,
    updatePriceChange,
    updateQuantity,
    errors,

    // slider
    sliderValue,
    setSliderValue,

    dialogOpen,
    setDialogOpen,
    onCloseDialog,
  };
};

export type LimitCloseBtnState = ReturnType<typeof useLimitCloseBtnScript>;
