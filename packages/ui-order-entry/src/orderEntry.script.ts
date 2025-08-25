import { useEffect, useRef, useMemo } from "react";
import {
  useComputedLTV,
  useEventEmitter,
  useLocalStorage,
  useMarginRatio,
  useOrderEntry,
} from "@orderly.network/hooks";
import {
  DistributionType,
  OrderLevel,
  OrderSide,
  OrderType,
  PositionType,
} from "@orderly.network/types";
import { convertValueToPercentage } from "@orderly.network/ui";
import { Decimal, removeTrailingZeros } from "@orderly.network/utils";
import { useAskAndBid } from "./hooks/useAskAndBid";
import { useBBOState } from "./hooks/useBBOState";
import { useCanTrade } from "./hooks/useCanTrade";
import { useFocusAndBlur } from "./hooks/useFocusAndBlur";
import { usePriceInputContainer } from "./hooks/usePriceInputContainer";
import { InputType } from "./types";
import { BBOStatus, isBBOOrder } from "./utils";

const safeNumber = (val: number | string) => {
  return Number.isNaN(Number(val)) ? 0 : Number(val);
};

export type OrderEntryScriptInputs = {
  symbol: string;
};

export const ORDERLY_ORDER_SOUND_ALERT_KEY = "orderly_order_sound_alert";

export type OrderEntryScriptReturn = ReturnType<typeof useOrderEntryScript>;

export const useOrderEntryScript = (inputs: OrderEntryScriptInputs) => {
  const [localOrderType, setLocalOrderType] = useLocalStorage(
    "orderly-order-entry-order-type",
    OrderType.LIMIT,
  );
  const [localOrderSide, setLocalOrderSide] = useLocalStorage(
    "orderly-order-entry-order-side",
    OrderSide.BUY,
  );

  const { notification } = useOrderlyContext();

  const [soundAlert, setSoundAlert] = useLocalStorage<boolean>(
    ORDERLY_ORDER_SOUND_ALERT_KEY,
    notification?.orderFilled?.defaultOpen ?? false,
  );

  const canTrade = useCanTrade();

  const { formattedOrder, setValue, setValues, symbolInfo, ...state } =
    useOrderEntry(inputs.symbol, {
      initialOrder: {
        symbol: inputs.symbol,
        order_type: localOrderType,
        position_type: PositionType.PARTIAL,
        side: localOrderSide,
      },
    });

  const [tpslSwitch, setTpslSwitch] = useLocalStorage(
    "orderly-order-entry-tp_sl-switch",
    false,
  );

  const { currentLeverage } = useMarginRatio();
  const ee = useEventEmitter();
  const triggerPriceInputRef = useRef<HTMLInputElement | null>(null);
  const priceInputRef = useRef<HTMLInputElement | null>(null);

  const { bboStatus, bboType, setBBOType, onBBOChange, toggleBBO } =
    useBBOState({
      tpslSwitch,
      order_type: formattedOrder.order_type,
      order_type_ext: formattedOrder.order_type_ext,
      side: formattedOrder.side,
      setValues,
    });

  const currentQtyPercentage = useMemo(() => {
    if (Number(formattedOrder.order_quantity) >= Number(state.maxQty)) {
      return 1;
    }
    return (
      convertValueToPercentage(
        Number(formattedOrder.order_quantity ?? 0),
        0,
        state.maxQty,
      ) / 100
    );
  }, [formattedOrder.order_quantity, state.maxQty]);

  const { currentFocusInput, lastScaledOrderPriceInput, onFocus, onBlur } =
    useFocusAndBlur({
      base_tick: symbolInfo?.base_tick,
      order_type: formattedOrder.order_type,
      order_quantity: formattedOrder.order_quantity,
      setValue,
    });

  // cancel TP/SL
  const cancelTP_SL = () => {
    // if(formattedOrder.)
    setValues({
      tp_trigger_price: "",
      sl_trigger_price: "",
      position_type: PositionType.FULL,
    });
  };

  const enableTP_SL = () => {
    setValues({
      order_type_ext: undefined,
      position_type: PositionType.FULL,
    });
  };

  const setMaxQty = () => {
    setValue("order_quantity", state.maxQty);
  };

  const setOrderValue = (
    key: any,
    value: any,
    options?: {
      shouldUpdateLastChangedField?: boolean;
    },
  ) => {
    if (key === "order_type") {
      setLocalOrderType(value);
    }
    if (key === "side") {
      setLocalOrderSide(value);
    }

    if (
      (key === "reduce_only" && value) ||
      (key === "order_type" &&
        (value === OrderType.STOP_LIMIT || value === OrderType.STOP_MARKET))
    ) {
      // cancelTP_SL();

      const data = {
        tp_trigger_price: "",
        sl_trigger_price: "",
        [key]: value,
      };

      if (key === "order_type") {
        data["order_type_ext" as any] = "";
      }

      setValues(data);

      return;
    }

    if (key === "order_type" && value !== OrderType.LIMIT) {
      const data = {
        level: undefined,
        order_type_ext: undefined,
        [key]: value,
      };

      setValues(data);

      return;
    }

    if (key === "order_type" && value === OrderType.SCALED) {
      setValues({
        distribution_type: DistributionType.FLAT,
        [key]: value,
      });
      return;
    }

    setValue(key, value, options);
  };

  const onTPSLSwitchChanged = (state: boolean) => {
    setTpslSwitch(state);
    if (state) {
      enableTP_SL();
    } else {
      cancelTP_SL();
    }
  };

  useEffect(() => {
    const updateOrderPrice = (price: string) => {
      setValue("order_price", price);
    };
    ee.on("update:orderPrice", updateOrderPrice);

    return () => {
      ee.off("update:orderPrice", updateOrderPrice);
    };
  }, []);

  useEffect(() => {
    const focusInputElement = (target: HTMLInputElement | null) => {
      requestAnimationFrame(() => {
        target?.focus();
      });
    };

    // handle orderbook item click event
    const orderBookItemClickHandler = (item: number[]) => {
      const price = removeTrailingZeros(item[0]);
      const { order_type, order_type_ext } = formattedOrder;

      // handle trigger price input, focus on trigger price input
      if (
        currentFocusInput.current === InputType.TRIGGER_PRICE &&
        (order_type === OrderType.STOP_LIMIT ||
          order_type === OrderType.STOP_MARKET)
      ) {
        setValue("trigger_price", price);
        focusInputElement(triggerPriceInputRef.current);
        return;
      }

      // handle bbo order, unselect bbo and set order price, focus on order price input
      if (isBBOOrder({ order_type, order_type_ext })) {
        setBBOType(undefined);

        setValues({
          order_type_ext: undefined,
          level: undefined,
        });

        requestAnimationFrame(() => {
          // Since BBO will update the price when unselected, we should set order price in requestAnimationFrame
          // We can't call setValue directly here because it's inside a requestAnimationFrame, and the formattedOrder accessed inside setValue would be the old value
          // setValue("order_price", price);
          ee.emit("update:orderPrice", price);
        });

        focusInputElement(priceInputRef.current);
        return;
      }

      // handle limit order and stop limit order, set order price and focus on order price input
      if (
        order_type === OrderType.STOP_LIMIT ||
        order_type === OrderType.LIMIT
      ) {
        setValue("order_price", price);
        focusInputElement(priceInputRef.current);
        return;
      }

      // handle stop market order, set trigger price and focus on trigger price input
      if (order_type === OrderType.STOP_MARKET) {
        setValue("trigger_price", price);
        focusInputElement(triggerPriceInputRef.current);
        return;
      }

      // handle market order, set order type to limit
      if (order_type === OrderType.MARKET) {
        // unselect bbo
        setBBOType(undefined);

        // You can't call setValue twice here , the second value will override the first, so you need to combine them into a single setValues call
        setValues({
          order_type: OrderType.LIMIT,
          order_price: price,
        });

        focusInputElement(priceInputRef.current);
        return;
      }

      if (
        order_type === OrderType.SCALED &&
        lastScaledOrderPriceInput.current
      ) {
        const field =
          lastScaledOrderPriceInput.current === InputType.START_PRICE
            ? "start_price"
            : "end_price";
        setValue(field, price);
        focusInputElement(priceInputRef.current);
        return;
      }

      // default, set order price and focus on order price input
      setValue("order_price", price);
      focusInputElement(priceInputRef.current);
    };

    ee.on("orderbook:item:click", orderBookItemClickHandler);

    return () => {
      ee.off("orderbook:item:click", orderBookItemClickHandler);
    };
    // Please do not modify this deps lightly, because `setValue` also relies on these state internally
  }, [formattedOrder, symbolInfo]);

  useEffect(() => {
    // after switching symbol, all the input number should be cleared (price, qty, TP/SL, etc)
    state.reset();
    state.resetMetaState();
  }, [inputs.symbol]);

  // if scaled order, and distribution_type is not set, set it to flat
  useEffect(() => {
    if (
      formattedOrder.order_type === OrderType.SCALED &&
      !formattedOrder.distribution_type
    ) {
      setValue("distribution_type", DistributionType.FLAT);
    }
  }, [formattedOrder.order_type, formattedOrder.distribution_type]);

  const currentLtv = useComputedLTV();
  const askAndBid = useAskAndBid();

  const fillMiddleValue = () => {
    if (bboStatus === BBOStatus.ON) {
      toggleBBO();
    }
    if (formattedOrder.order_type === OrderType.LIMIT) {
      const [bestAsk = 0, bestBid = 0] = askAndBid;
      const midPrice = new Decimal(safeNumber(bestAsk))
        .add(safeNumber(bestBid))
        .div(2)
        .toNumber();
      // 1. Since BBO will update the price when unselected, we should set order price in raf
      // 2. raf is mainly used to solve the timing problem caused by React state update, ensuring that the orderPrice is triggered after the state is fully updated to avoid accessing expired state values.
      requestAnimationFrame(() => {
        ee.emit("update:orderPrice", midPrice);
      });
    }
  };

  const { priceInputContainerRef, priceInputContainerWidth } =
    usePriceInputContainer({
      order_type_ext: formattedOrder.order_type_ext,
    });

  return {
    ...state,
    currentQtyPercentage,
    side: formattedOrder.side as OrderSide,
    type: formattedOrder.order_type as OrderType,
    level: formattedOrder.level as OrderLevel,
    setOrderValue,
    setOrderValues: setValues,

    currentLeverage,

    formattedOrder,
    // cancelTP_SL,
    // enableTP_SL,
    tpslSwitch,
    setTpslSwitch: onTPSLSwitchChanged,
    setMaxQty,
    symbolInfo,
    onFocus,
    onBlur,
    refs: {
      triggerPriceInputRef,
      priceInputRef,
      priceInputContainerRef,
    },
    canTrade,
    bboStatus,
    bboType,
    onBBOChange,
    toggleBBO,
    priceInputContainerWidth,
    currentLtv,
    fillMiddleValue,
    symbol: inputs.symbol,
    soundAlert: soundAlert,
    setSoundAlert: setSoundAlert,
  };
};
