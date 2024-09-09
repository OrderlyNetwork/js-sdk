import {
  OrderlyOrder,
  OrderSide,
  OrderType,
  RequireKeys,
} from "@orderly.network/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type FullOrderState = OrderlyOrder;

type OrderEntryStateEntity = RequireKeys<FullOrderState, "side" | "type">;

type OrderEntryState = {
  entry: OrderEntryStateEntity;
  errors: Partial<Record<keyof FullOrderState, string>>;
};

type OrderEntryActions = {
  updateOrder: (order: Partial<FullOrderState>) => void;
  updateOrderByKey: <K extends keyof FullOrderState>(
    key: K,
    value: FullOrderState[K]
  ) => void;
  restoreOrder: (order: Partial<FullOrderState>) => void;
  resetOrder: () => void;
  hasTP_SL: () => boolean;
};

const initialOrderState = {
  side: OrderSide.BUY as OrderSide,
  type: OrderType.LIMIT as OrderType,
} as OrderEntryStateEntity;

export const useOrderStore = create<
  OrderEntryState & {
    actions: OrderEntryActions;
  }
>()(
  devtools(
    immer((set, get) => ({
      entry: {
        ...initialOrderState,
      },
      errors: {},
      actions: {
        hasTP_SL: () => {
          const order = get().entry;
          return (
            typeof order.tp_trigger_price !== "undefined" ||
            typeof order.sl_trigger_price !== "undefined"
          );
        },
        updateOrder: (order: Partial<FullOrderState>) => {
          set(
            (state) => {
              // state.entry[key as keyof BracketOrderEntry] = value;
              state.entry = {
                ...state.entry,
                ...order,
              };
            },
            false,
            "updateOrder"
          );
        },
        updateOrderByKey: <K extends keyof FullOrderState>(
          key: K,
          value: FullOrderState[K]
        ) => {
          set(
            (state) => {
              state.entry[key] = value;
            },
            false,
            "updateOrderByKey"
          );
        },
        restoreOrder: (order) => {
          set(
            (state) => {
              state.entry = {
                ...order,
                symbol: state.entry.symbol,
              } as OrderEntryStateEntity;
            },
            false,
            "restoreOrder"
          );
        },
        resetOrder: () => {
          set(
            (state) => {
              state.entry = {
                // side: OrderSide.BUY as OrderSide,
                // type: OrderType.LIMIT as OrderType,
                ...initialOrderState,
              } as OrderEntryStateEntity;
            },
            true,
            "resetOrder"
          );
        },
      },
    })),
    {
      name: "markPrice",
    }
  )
);

export const useOrderEntryFromStore = () =>
  useOrderStore((state) => state.entry);
