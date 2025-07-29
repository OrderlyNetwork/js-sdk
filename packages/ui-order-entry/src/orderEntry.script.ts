import { useEffect, useRef, FocusEvent, useMemo, useState } from "react";
import {
  useAccount,
  useComputedLTV,
  useDebouncedCallback,
  useEventEmitter,
  useLocalStorage,
  useMarginRatio,
  useOrderEntry,
  utils,
} from "@orderly.network/hooks";
import { useAppContext } from "@orderly.network/react-app";
import {
  BBOOrderType,
  DistributionType,
  OrderLevel,
  OrderSide,
  OrderType,
} from "@orderly.network/types";
import { AccountStatusEnum } from "@orderly.network/types";
import { convertValueToPercentage } from "@orderly.network/ui";
import { Decimal, removeTrailingZeros } from "@orderly.network/utils";
import { InputType } from "./types";
import {
  BBOStatus,
  getOrderLevelByBBO,
  getOrderTypeByBBO,
  isBBOOrder,
} from "./utils";

const safeNumber = (val: number | string) => {
  return Number.isNaN(Number(val)) ? 0 : Number(val);
};

export type OrderEntryScriptInputs = {
  symbol: string;
};

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
  const [localBBOType, setLocalBBOType] = useLocalStorage<
    BBOOrderType | undefined
  >("orderly_order_bbo_type", undefined);

  const [quantityUnit, setQuantityUnit] = useLocalStorage<"quote" | "base">(
    "orderly_order_quantity_unit",
    "quote",
  );

  const lastBBOType = useRef<BBOOrderType>(localBBOType);

  const { formattedOrder, setValue, setValues, symbolInfo, ...state } =
    useOrderEntry(inputs.symbol, {
      initialOrder: {
        symbol: inputs.symbol,
        order_type: localOrderType,
        side: localOrderSide,
      },
    });

  const [tpslSwitch, setTpslSwitch] = useLocalStorage(
    "orderly-order-entry-tp_sl-switch",
    false,
  );

  const { state: accountState } = useAccount();
  const { wrongNetwork, disabledConnect } = useAppContext();

  const canTrade = useMemo(() => {
    return (
      !wrongNetwork &&
      !disabledConnect &&
      (accountState.status === AccountStatusEnum.EnableTrading ||
        accountState.status === AccountStatusEnum.EnableTradingWithoutConnected)
    );
  }, [accountState.status, wrongNetwork, disabledConnect]);

  const { currentLeverage } = useMarginRatio();
  const ee = useEventEmitter();

  const currentFocusInput = useRef<InputType>(InputType.NONE);
  const lastScaledOrderPriceInput = useRef<InputType>(InputType.END_PRICE);
  const triggerPriceInputRef = useRef<HTMLInputElement | null>(null);
  const priceInputRef = useRef<HTMLInputElement | null>(null);
  const priceInputContainerRef = useRef<HTMLDivElement | null>(null);
  const [priceInputContainerWidth, setPriceInputContainerWidth] = useState(0);

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

  const formatQty = () => {
    if (
      symbolInfo.base_tick < 1 ||
      // scaled order should not format quantity, because it is total quantity
      formattedOrder.order_type === OrderType.SCALED ||
      !formattedOrder.order_quantity
    ) {
      return;
    }

    // TODO: use this to format quantity instead of utils.formatNumber, need time to test
    // const formatQty = new Decimal(formattedOrder.order_quantity)
    //   .todp(0, Decimal.ROUND_DOWN)
    //   .div(symbolInfo.base_tick)
    //   .toString();

    const quantity = utils.formatNumber(
      formattedOrder?.order_quantity,
      new Decimal(symbolInfo?.base_tick || "0").toNumber(),
    );

    setValue("order_quantity", quantity, {
      shouldUpdateLastChangedField: false,
    });
  };

  const onFocus = (type: InputType) => (_: FocusEvent) => {
    currentFocusInput.current = type;

    // set last scaled order price input
    if (
      [InputType.START_PRICE, InputType.END_PRICE].includes(
        currentFocusInput.current!,
      )
    ) {
      lastScaledOrderPriceInput.current = type;
    }
  };

  const onBlur = (type: InputType) => (_: FocusEvent) => {
    setTimeout(() => {
      if (currentFocusInput.current !== type) {
        return;
      }
      currentFocusInput.current = InputType.NONE;
    }, 300);

    if (type === InputType.QUANTITY) {
      formatQty();
    }
  };

  // cancel TP/SL
  const cancelTP_SL = () => {
    // if(formattedOrder.)
    setValues({
      tp_trigger_price: "",
      sl_trigger_price: "",
    });
  };

  const enableTP_SL = () => {
    setValues({
      order_type_ext: undefined,
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

  const bboStatus = useMemo(() => {
    if (
      tpslSwitch ||
      [OrderType.POST_ONLY, OrderType.IOC, OrderType.FOK].includes(
        formattedOrder.order_type_ext!,
      )
    ) {
      return BBOStatus.DISABLED;
    }

    return localBBOType && formattedOrder.order_type === OrderType.LIMIT
      ? BBOStatus.ON
      : BBOStatus.OFF;
  }, [
    tpslSwitch,
    formattedOrder.order_type_ext,
    formattedOrder.order_type,
    localBBOType,
  ]);

  const toggleBBO = () => {
    if (localBBOType) {
      // unselect bbo
      setLocalBBOType(undefined);
      // update formattedOrder values immediately instead of via useEffect
      setValues({
        order_type_ext: undefined,
        level: undefined,
      });
    } else {
      setLocalBBOType(lastBBOType.current || BBOOrderType.COUNTERPARTY1);
    }
  };

  const onBBOChange = (value: BBOOrderType) => {
    setLocalBBOType(value);
    lastBBOType.current = value;
  };

  useEffect(() => {
    if (bboStatus === BBOStatus.DISABLED) {
      const { order_type_ext } = formattedOrder;
      setValues({
        // if order_type_ext is not bbo(ask, bid), keep previous value
        order_type_ext: isBBOOrder({ order_type_ext })
          ? undefined
          : order_type_ext,
        level: undefined,
      });
    }
  }, [bboStatus, formattedOrder.order_type_ext]);

  useEffect(() => {
    if (bboStatus === BBOStatus.ON) {
      const orderType = getOrderTypeByBBO(localBBOType, formattedOrder.side!);
      const orderLevel = getOrderLevelByBBO(localBBOType)!;
      setValues({
        order_type_ext: orderType,
        level: orderLevel,
      });
    }
  }, [localBBOType, bboStatus, formattedOrder.side]);

  // useEffect(() => {
  //   if (
  //     priceInputContainerRef.current &&
  //     // update BBO select width when is BBO order
  //     isBBOOrder({ order_type_ext: formattedOrder.order_type_ext })
  //   ) {
  //     const width =
  //       priceInputContainerRef.current.getBoundingClientRect()?.width;
  //     if (width) {
  //       setPriceInputContainerWidth(width);
  //     }
  //   }
  // }, [priceInputContainerRef, formattedOrder.order_type_ext]);

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
      setTimeout(() => {
        target?.focus();
      }, 0);
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
        setLocalBBOType(undefined);

        setValues({
          order_type_ext: undefined,
          level: undefined,
        });

        setTimeout(() => {
          // Since BBO will update the price when unselected, we should set order price in setTimeout
          // We can't call setValue directly here because it's inside a setTimeout, and the formattedOrder accessed inside setValue would be the old value
          // setValue("order_price", price);
          ee.emit("update:orderPrice", price);
        }, 0);

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
        setLocalBBOType(undefined);

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
    const element = priceInputContainerRef.current;

    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width) {
          // update BBO order select dropdown width when priceInputContainerRef width changed
          setPriceInputContainerWidth(width);
        }
      }
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.unobserve(element);
    };
  }, [priceInputContainerRef, formattedOrder.order_type_ext]);

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

  const [askAndBid, setAskAndBid] = useState<[number, number]>([0, 0]);

  const onOrderBookUpdate = useDebouncedCallback((data: any) => {
    setAskAndBid([data.asks?.[data.asks.length - 1]?.[0], data.bids?.[0]?.[0]]);
  }, 200);

  useEffect(() => {
    ee.on("orderbook:update", onOrderBookUpdate);
    return () => {
      ee.off("orderbook:update", onOrderBookUpdate);
      onOrderBookUpdate.cancel();
    };
  }, [onOrderBookUpdate]);

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
      setValue("order_price", midPrice);
    }
  };

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
    bboType: localBBOType,
    onBBOChange,
    toggleBBO,
    priceInputContainerWidth,
    currentLtv,
    fillMiddleValue,
    quantityUnit,
    setQuantityUnit,
  };
};
