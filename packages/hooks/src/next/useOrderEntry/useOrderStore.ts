import { useState } from "react";
import { produce } from "immer";
import {
  OrderlyOrder,
  OrderSide,
  OrderType,
  RequireKeys,
} from "@orderly.network/types";

export type FullOrderState = OrderlyOrder;

type OrderEntryStateEntity = RequireKeys<
  FullOrderState,
  "side" | "order_type" | "symbol"
>;

type OrderEntryState = {
  entry: OrderEntryStateEntity;
  estLeverage: number | null;
  estLiquidationPrice: number | null;
  errors: Partial<Record<keyof FullOrderState, string>>;
};

type OrderEntryActions = {
  updateOrder: (order: Partial<FullOrderState>) => void;
  updateOrderByKey: <K extends keyof FullOrderState>(
    key: K,
    value: FullOrderState[K]
  ) => void;
  restoreOrder: (order?: Partial<FullOrderState>) => void;
  updateOrderComputed: (data: {
    estLeverage: number | null;
    estLiquidationPrice: number | null;
  }) => void;
  resetOrder: (order?: Partial<FullOrderState>) => void;
  hasTP_SL: () => boolean;
};

const initialOrderState = {
  order_price: "",
  order_quantity: "",
  trigger_price: "",
  tp_trigger_price: "",
  sl_trigger_price: "",
  total: "",
  symbol: "",
};

export const useOrderStore = () => {
  const [entry, setEntry] = useState<OrderEntryStateEntity>({
    side: OrderSide.BUY,
    order_type: OrderType.LIMIT,
    ...initialOrderState,
  });
  const [estLeverage, setEstLeverage] = useState<number | null>(null);
  const [estLiquidationPrice, setEstLiquidationPrice] = useState<number | null>(
    null
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof FullOrderState, string>>
  >({});

  const updateOrder = (order: Partial<FullOrderState>) => {
    setEntry(
      produce((draft) => {
        return { ...draft, ...order };
      })
    );
  };

  const updateOrderByKey = <K extends keyof FullOrderState>(
    key: K,
    value: FullOrderState[K]
  ) => {
    setEntry(
      produce((draft) => {
        draft[key] = value;
      })
    );
  };

  const restoreOrder = (order?: Partial<FullOrderState>) => {
    setEntry(produce((draft) => order as OrderEntryStateEntity));
  };

  const updateOrderComputed = (data: {
    estLeverage: number | null;
    estLiquidationPrice: number | null;
  }) => {
    setEstLeverage(data.estLeverage);
    setEstLiquidationPrice(data.estLiquidationPrice);
  };

  const resetOrder = (order?: Partial<FullOrderState>) => {
    setEntry(
      produce((draft) => ({
        side: OrderSide.BUY,
        order_type: OrderType.LIMIT,
        ...initialOrderState,
      }))
    );
  };

  const hasTP_SL = () => {
    return (
      typeof entry.tp_trigger_price !== "undefined" ||
      typeof entry.sl_trigger_price !== "undefined"
    );
  };

  return {
    entry,
    estLeverage,
    estLiquidationPrice,
    errors,
    actions: {
      updateOrder,
      updateOrderByKey,
      restoreOrder,
      updateOrderComputed,
      resetOrder,
      hasTP_SL,
    },
  };
};
