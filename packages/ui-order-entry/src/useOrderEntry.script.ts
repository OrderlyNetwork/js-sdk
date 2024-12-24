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
import { BBOStatus, getOrderLevelByBBO, getOrderTypeByBBO } from "./utils";

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
  const { wrongNetwork } = useAppContext();
  const canTrade = useMemo(() => {
    return (
      accountState.status === AccountStatusEnum.EnableTrading && !wrongNetwork
    );
  }, [accountState.status, wrongNetwork]);

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

    if (type === InputType.QUANTITY || type === InputType.TOTAL) {
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

  useEffect(() => {
    if (priceInputContainerRef.current) {
      const rect = priceInputContainerRef.current.getBoundingClientRect();
      setPriceInputContainerWidth(rect?.width || 0);
    }
  }, [priceInputContainerRef]);

  const bboStatus = useMemo(() => {
    const enable =
      localBBOType && formattedOrder.order_type === OrderType.LIMIT;

    if (enable && tpslSwitch) {
      return BBOStatus.DISABLED;
    }

    return enable ? BBOStatus.ON : BBOStatus.OFF;
  }, [localBBOType, formattedOrder.order_type, tpslSwitch]);

  const toggleBBO = () => {
    if (bboStatus === BBOStatus.DISABLED) {
      return;
    }
    if (localBBOType) {
      setLocalBBOType(undefined);
      setOrderValue("order_type_ext", undefined);
    } else {
      setLocalBBOType(BBOOrderType.COUNTERPARTY1);
    }
  };

  const onBBOChange = (value: BBOOrderType) => {
    setLocalBBOType(value);
  };

  useEffect(() => {
    if (bboStatus === BBOStatus.DISABLED) {
      setValues({
        order_type_ext: undefined,
        level: undefined,
      });
    }
  }, [bboStatus]);

  useEffect(() => {
    if (
      localBBOType &&
      formattedOrder.order_type === OrderType.LIMIT &&
      !tpslSwitch
    ) {
      const orderType = getOrderTypeByBBO(localBBOType, formattedOrder.side!);
      const orderLevel = getOrderLevelByBBO(localBBOType)!;
      setValues({
        order_type_ext: orderType,
        level: orderLevel,
      });
    }
  }, [
    localBBOType,
    formattedOrder.order_type,
    formattedOrder.side!,
    tpslSwitch,
  ]);

  // console.log(
  //   "===",
  //   localBBOType,
  //   formattedOrder.order_type,
  //   formattedOrder.order_type_ext,
  //   formattedOrder.level
  // );

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
