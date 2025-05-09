import {
  BBOOrderType,
  OrderLevel,
  OrderSide,
  OrderType,
} from "@orderly.network/types";
import {
  useAccount,
  useEventEmitter,
  useLocalStorage,
  useMarginRatio,
  useOrderEntry,
  utils,
} from "@orderly.network/hooks";
import { useEffect, useRef, FocusEvent, useMemo, useState } from "react";
import { Decimal, removeTrailingZeros } from "@orderly.network/utils";
import { InputType } from "./types";
import { convertValueToPercentage } from "@orderly.network/ui";
import { AccountStatusEnum } from "@orderly.network/types";
import { useAppContext } from "@orderly.network/react-app";
import {
  BBOStatus,
  getOrderLevelByBBO,
  getOrderTypeByBBO,
  isBBOOrder,
} from "./utils";

export type OrderEntryScriptInputs = {
  symbol: string;
};

export const useOrderEntryScript = (inputs: OrderEntryScriptInputs) => {
  const [localOrderType, setLocalOrderType] = useLocalStorage(
    "orderly-order-entry-order-type",
    OrderType.LIMIT
  );
  const [localOrderSide, setLocalOrderSide] = useLocalStorage(
    "orderly-order-entry-order-side",
    OrderSide.BUY
  );
  const [localBBOType, setLocalBBOType] = useLocalStorage<
    BBOOrderType | undefined
  >("orderly_order_bbo_type", undefined);

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
    false
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

  // const [maxLeverage] = useLeverage();
  const { currentLeverage } = useMarginRatio();
  const ee = useEventEmitter();

  const currentFocusInput = useRef<InputType>(InputType.NONE);
  const triggerPriceInputRef = useRef<HTMLInputElement | null>(null);
  const priceInputRef = useRef<HTMLInputElement | null>(null);
  const priceInputContainerRef = useRef<HTMLDivElement | null>(null);
  const [priceInputContainerWidth, setPriceInputContainerWidth] = useState(0);

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

  const formatQty = () => {
    if (symbolInfo.base_tick < 1) return;
    const quantity = utils.formatNumber(
      formattedOrder?.order_quantity,
      new Decimal(symbolInfo?.base_tick || "0").toNumber()
    );
    setValue("order_quantity", quantity, {
      shouldUpdateLastChangedField: false,
    });
  };

  const onFocus = (type: InputType) => (_: FocusEvent) => {
    currentFocusInput.current = type;
  };

  const onBlur = (type: InputType) => (_: FocusEvent) => {
    setTimeout(() => {
      if (currentFocusInput.current !== type) return;
      currentFocusInput.current = InputType.NONE;
    }, 300);

    if (type === InputType.QUANTITY) {
      formatQty();
    }
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
            setValue("trigger_price", removeTrailingZeros(item[0]));
            focusInputElement(triggerPriceInputRef.current);
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
      ee.off("orderbook:item:click", orderBookItemClickHandler);
    };
  }, [formattedOrder, symbolInfo]);

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
    }
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
        formattedOrder.order_type_ext!
      )
    ) {
      return BBOStatus.DISABLED;
    }

    return localBBOType && formattedOrder.order_type === OrderType.LIMIT
      ? BBOStatus.ON
      : BBOStatus.OFF;
  }, [
    localBBOType,
    tpslSwitch,
    formattedOrder.order_type,
    formattedOrder.order_type_ext!,
  ]);

  const toggleBBO = () => {
    if (localBBOType) {
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
  }, [localBBOType, bboStatus, formattedOrder.side!]);

  // console.log(
  //   "===",
  //   localBBOType,
  //   formattedOrder.order_type,
  //   formattedOrder.order_type_ext,
  //   formattedOrder.level
  // );

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
    const element = priceInputContainerRef.current;

    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
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
  };
};

export type uesOrderEntryScriptReturn = ReturnType<typeof useOrderEntryScript>;
