import { useEffect, useMemo, useRef } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import {
  BBOOrderType,
  OrderlyOrder,
  OrderSide,
  OrderType,
} from "@orderly.network/types";
import {
  BBOStatus,
  getOrderLevelByBBO,
  getOrderTypeByBBO,
  isBBOOrder,
} from "../utils";

export function useBBOState({
  tpslSwitch,
  order_type,
  order_type_ext,
  side,
  setValues,
}: {
  tpslSwitch: boolean;
  order_type?: OrderType;
  order_type_ext?: OrderType;
  side?: OrderSide;
  setValues: (values: Partial<OrderlyOrder>) => void;
}) {
  const [localBBOType, setLocalBBOType] = useLocalStorage<
    BBOOrderType | undefined
  >("orderly_order_bbo_type", undefined);

  const lastBBOType = useRef<BBOOrderType>(localBBOType);

  const bboStatus = useMemo(() => {
    if (
      tpslSwitch ||
      [OrderType.POST_ONLY, OrderType.IOC, OrderType.FOK].includes(
        order_type_ext!,
      )
    ) {
      return BBOStatus.DISABLED;
    }

    return localBBOType && order_type === OrderType.LIMIT
      ? BBOStatus.ON
      : BBOStatus.OFF;
  }, [tpslSwitch, order_type_ext, order_type, localBBOType]);

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
      setValues({
        // if order_type_ext is not bbo(ask, bid), keep previous value
        order_type_ext: isBBOOrder({ order_type_ext })
          ? undefined
          : order_type_ext,
        level: undefined,
      });
    }
  }, [bboStatus, order_type_ext]);

  useEffect(() => {
    if (bboStatus === BBOStatus.ON) {
      const orderType = getOrderTypeByBBO(localBBOType, side!);
      const orderLevel = getOrderLevelByBBO(localBBOType)!;
      setValues({
        order_type_ext: orderType,
        level: orderLevel,
      });
    }
  }, [localBBOType, bboStatus, side]);

  return {
    bboStatus,
    bboType: localBBOType,
    setBBOType: setLocalBBOType,
    onBBOChange,
    toggleBBO,
  };
}
