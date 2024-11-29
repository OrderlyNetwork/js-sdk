import { OrderSide, OrderType } from "@orderly.network/types";
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
  }, [
    formattedOrder.order_type,
    formattedOrder.order_quantity,
    formattedOrder.side,
    formattedOrder.symbol,
    symbolInfo,
  ]);

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

      setValues({
        tp_trigger_price: "",
        sl_trigger_price: "",
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
  return {
    ...state,
    currentQtyPercentage,
    side: formattedOrder.side as OrderSide,
    type: formattedOrder.order_type as OrderType,
    setOrderValue,

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
    },

    canTrade,
  };
};

export type uesOrderEntryScriptReturn = ReturnType<typeof useOrderEntryScript>;
