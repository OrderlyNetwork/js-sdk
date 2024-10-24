import { OrderSide, OrderType } from "@orderly.network/types";
import {
  useEventEmitter,
  useMarginRatio,
  useOrderEntry,
} from "@orderly.network/hooks";
import { useEffect, useRef, FocusEvent, useMemo } from "react";
import { removeTrailingZeros } from "@orderly.network/utils";
import { InputType } from "./types";
import { convertValueToPercentage } from "@orderly.network/ui";

export type OrderEntryScriptInputs = {
  symbol: string;
};

export const useOrderEntryScript = (inputs: OrderEntryScriptInputs) => {
  const { formattedOrder, setValue, setValues, symbolInfo, ...state } =
    useOrderEntry(inputs.symbol, {});

  // const [maxLeverage] = useLeverage();
  const { currentLeverage } = useMarginRatio();
  const ee = useEventEmitter();

  const currentFocusInput = useRef<InputType>(InputType.NONE);
  const triggerPriceInputRef = useRef<HTMLInputElement | null>(null);
  const priceInputRef = useRef<HTMLInputElement | null>(null);

  const currentQtyPercentage = useMemo(() => {
    if (Number(formattedOrder.order_quantity) >= Number(state.maxQty)) return 1;
    return (
      convertValueToPercentage(
        Number(formattedOrder.order_quantity ?? 0),
        0,
        state.maxQty
      ) / 100
    );
  }, [formattedOrder.order_quantity, state.maxQty]);

  const onFocus = (type: InputType) => (_: FocusEvent) => {
    currentFocusInput.current = type;
  };

  const onBlur = (type: InputType) => (_: FocusEvent) => {
    setTimeout(() => {
      if (currentFocusInput.current !== type) return;
      currentFocusInput.current = InputType.NONE;
    }, 300);

    // if (type === InputType.QUANTITY) {
    //   formatQty();
    // }
  };

  useEffect(() => {
    // handle orderbook item click event
    const orderBookItemClickHandler = (item: number[]) => {
      if (currentFocusInput.current === InputType.TRIGGER_PRICE) {
        if (
          formattedOrder.order_type === OrderType.STOP_LIMIT ||
          formattedOrder.order_type === OrderType.STOP_MARKET
        ) {
          setValue("trigger_price", removeTrailingZeros(item[0]));
          focusInputElement(triggerPriceInputRef.current);
        }
      } else {
        if (
          formattedOrder.order_type === OrderType.STOP_LIMIT ||
          formattedOrder.order_type === OrderType.LIMIT
        ) {
          setValue("order_price", removeTrailingZeros(item[0]));
          focusInputElement(priceInputRef.current);
        } else {
          let newType;

          if (formattedOrder.order_type === OrderType.STOP_MARKET) {
            newType = OrderType.STOP_LIMIT;
          } else if (formattedOrder.order_type === OrderType.MARKET) {
            newType = OrderType.LIMIT;
          }

          if (typeof newType !== "undefined") {
            setValue("order_type", newType);
          }
          setValue("order_price", removeTrailingZeros(item[0]));
          focusInputElement(priceInputRef.current);
        }
      }

      function focusInputElement(target: HTMLInputElement | null) {
        setTimeout(() => {
          target?.focus();
        }, 0);
      }
    };

    ee.on("orderbook:item:click", orderBookItemClickHandler);

    return () => {
      console.log("useOrderEntry: removeListener");
      ee.off("orderbook:item:click", orderBookItemClickHandler);
    };
  }, [formattedOrder.order_type, formattedOrder.order_quantity, symbolInfo]);

  // cancel TP/SL
  const cancelTP_SL = () => {
    // if(formattedOrder.)
    setValues({
      tp_trigger_price: "",
      sl_trigger_price: "",
    });
  };

  const setMaxQty = () => {
    setValue("order_quantity", state.maxQty);
  };

  return {
    ...state,
    currentQtyPercentage,
    side: formattedOrder.side as OrderSide,
    type: formattedOrder.order_type as OrderType,
    setOrderValue: setValue,

    currentLeverage,

    formattedOrder,
    cancelTP_SL,
    setMaxQty,
    symbolInfo,
    onFocus,
    onBlur,
    refs: {
      triggerPriceInputRef,
      priceInputRef,
    },
  };
};

export type uesOrderEntryScriptReturn = ReturnType<typeof useOrderEntryScript>;
