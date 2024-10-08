import { useEffect, useMemo, useRef, useState } from "react";
import { OrderCellState } from "../orderCell.script";
import { useOrderEntry } from "@orderly.network/hooks";
import { Decimal } from "@orderly.network/utils";
import { useModal } from "@orderly.network/ui";

export const useEditSheetScript = (props: { state: OrderCellState }) => {
    const { state } = props;
    const { item: order } = state;
    const { hide } = useModal();
    const [dialogOpen, setDialogOpen] = useState(false);
  
    const isAlgoOrder = order?.algo_order_id !== undefined;
    const isStopMarket = order?.type === "MARKET" && isAlgoOrder;
  
    const [price, setPrice] = useState(order.price ?? "Market");
    const [triggerPrice, setTriggerPrice] = useState(`${order.trigger_price}`);
    const [quantity, setQuantity] = useState(`${order.quantity}`);
    
    const [sliderValue, setSliderValue] = useState< undefined | number>(undefined);
    
    const { markPrice, maxQty, helper, metaState } = useOrderEntry(
      // @ts-ignore
      order.symbol,
      order.side
    );
  
    const onClose = () => {
        hide();
    };
  
    useEffect(() => {
      if (typeof sliderValue === 'undefined' && maxQty) {
        const value = new Decimal(order.quantity).div(maxQty).toNumber();
        setSliderValue(value);
      }
    }, [maxQty, setSliderValue]);

    console.log("percentages," , (Number(quantity)) / maxQty);
    
    const percentages = useMemo(() => {
        return Math.min((Number(quantity)) / maxQty, 1);
    }, [quantity]);
  
    return {
      ...state,
      curMarkPrice: markPrice,
      isAlgoOrder,
      isStopMarket,
      price,
      setPrice,
      priceEdit: !isStopMarket,
      triggerPrice,
      setTriggerPrice,
      quantity,
      setQuantity,
      maxQty,
      sliderValue,
      setSliderValue,
      percentages,
      onClose,
  
      dialogOpen,
      setDialogOpen,
    };
};

export type EditSheetState = ReturnType<typeof useEditSheetScript>;
