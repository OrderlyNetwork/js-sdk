import { OrderlyOrder, OrderSide, OrderType } from "@orderly.network/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type FullOrderState = OrderlyOrder;

type OrderEntryState = {
  entry: Partial<FullOrderState>;
  errors: Record<string, string>;
};

type OrderEntryActions = {
  updateOrder: (order: Partial<FullOrderState>) => void;
  updateOrderByKey: (key: string, value: any) => void;
  restoreOrder: (order: Partial<FullOrderState>) => void;
  resetOrder: () => void;
  hasTP_SL: () => boolean;
};

export const useOrderStore = create<
  OrderEntryState & {
    actions: OrderEntryActions;
  }
>()(
  devtools(
    immer((set, get) => ({
      entry: {
        side: OrderSide.BUY as OrderSide,
        type: OrderType.LIMIT as OrderType,
      } as Partial<FullOrderState>,
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
        updateOrderByKey: (key: string, value: any) => {
          set(
            (state) => {
              state.entry[key as keyof FullOrderState] = value;
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
              };
            },
            false,
            "restoreOrder"
          );
        },
        resetOrder: () => {
          set(
            (state) => {
              state.entry = {};
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
