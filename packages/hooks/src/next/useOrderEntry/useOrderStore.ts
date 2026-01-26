import { useMemo } from "react";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { OrderlyOrder, OrderType, RequireKeys } from "@orderly.network/types";

export type FullOrderState = OrderlyOrder;

type OrderEntryStateEntity = RequireKeys<
  FullOrderState,
  "side" | "order_type" | "symbol"
>;

/**
 * Default initial state for order fields
 * Used when resetting the order to default values
 */
const initialOrderState = {
  order_price: "",
  order_quantity: "",
  trigger_price: "",
  tp_trigger_price: "",
  sl_trigger_price: "",
  tp_order_type: OrderType.MARKET,
  tp_pnl: "",
  sl_pnl: "",
  tp_offset_percentage: "",
  sl_offset_percentage: "",
  tp_offset: "",
  sl_offset: "",
  sl_order_type: OrderType.MARKET,
  total: "",

  // scaled order
  start_price: "",
  end_price: "",
  totalOrders: "",
  distribution_type: "",
  skew: "",

  // trailing stop order
  activated_price: "",
  callback_value: "",
  callback_rate: "",
};

/**
 * Store state interface
 */
type OrderStoreState = {
  entry: OrderEntryStateEntity;
  estLeverage: number | null;
  estLiquidationPrice: number | null;
  errors: Partial<Record<keyof FullOrderState, string>>;
};

/**
 * Store actions interface
 */
type OrderStoreActions = {
  updateOrder: (order: Partial<FullOrderState>) => void;
  updateOrderByKey: <K extends keyof FullOrderState>(
    key: K,
    value: FullOrderState[K],
  ) => void;
  restoreOrder: (order?: Partial<FullOrderState>) => void;
  updateOrderComputed: (data: {
    estLeverage: number | null;
    estLiquidationPrice: number | null;
  }) => void;
  resetOrder: (order?: Partial<FullOrderState>) => void;
  hasTP_SL: () => boolean;
};

/**
 * Creates a zustand store with immer middleware for order entry state management
 * Uses immer middleware to enable direct mutations of draft state
 *
 * @param initialOrder - Initial order state entity
 * @returns Zustand store instance with immer middleware
 */
const createOrderStore = (initialOrder: OrderEntryStateEntity) => {
  return create<OrderStoreState & { actions: OrderStoreActions }>()(
    immer((set, get) => ({
      entry: initialOrder,
      estLeverage: null,
      estLiquidationPrice: null,
      errors: {},
      actions: {
        /**
         * Updates multiple order fields at once
         * Uses Object.assign to merge updates, avoiding unnecessary re-renders
         * when object references haven't changed
         */
        updateOrder: (order: Partial<FullOrderState>) => {
          set((state) => {
            // Direct mutation with immer - Object.assign prevents extra updates
            // when object references haven't changed
            Object.assign(state.entry, order);
          });
        },

        /**
         * Updates a single order field by key
         * More efficient for single field updates
         */
        updateOrderByKey: <K extends keyof FullOrderState>(
          key: K,
          value: FullOrderState[K],
        ) => {
          set((state) => {
            state.entry[key] = value;
          });
        },

        /**
         * Restores order to a new state, replacing the entire entry
         */
        restoreOrder: (order?: Partial<FullOrderState>) => {
          set((state) => {
            state.entry = (order ?? initialOrder) as OrderEntryStateEntity;
          });
        },

        /**
         * Updates computed values (leverage and liquidation price)
         * These are calculated values, not direct user input
         */
        updateOrderComputed: (data: {
          estLeverage: number | null;
          estLiquidationPrice: number | null;
        }) => {
          set((state) => {
            state.estLeverage = data.estLeverage;
            state.estLiquidationPrice = data.estLiquidationPrice;
          });
        },

        /**
         * Resets order fields to default or provided values
         * Merges reset values with existing entry state
         */
        resetOrder: (order?: Partial<FullOrderState>) => {
          set((state) => {
            // Reset to initial state or provided order, merging with current entry
            const resetValues = order ?? initialOrderState;
            Object.assign(state.entry, resetValues);
          });
        },

        /**
         * Checks if the order has take profit or stop loss configured
         * @returns true if TP or SL trigger price is defined
         */
        hasTP_SL: () => {
          const entry = get().entry;
          return (
            typeof entry.tp_trigger_price !== "undefined" ||
            typeof entry.sl_trigger_price !== "undefined"
          );
        },
      },
    })),
  );
};

/**
 * Hook to create and use an order store instance
 * Creates a new zustand store with immer middleware for each component instance
 * This allows each component to have its own isolated order state
 *
 * Note: The store is created once per component instance using the initial order.
 * If the initialOrder object reference changes between renders, the store will
 * still use the initial value from the first render. To update the order state,
 * use the actions (e.g., restoreOrder, updateOrder).
 *
 * @param initialOrder - Initial order state entity
 * @returns Store state and actions
 */
export const useOrderStore = (initialOrder: OrderEntryStateEntity) => {
  // Create store instance once per component with the initial order
  // useMemo ensures the store is only created once and reused across re-renders
  // The store manages its own state after creation, so we don't need to recreate
  // it when initialOrder reference changes
  const store = useMemo(() => createOrderStore(initialOrder), []);

  // Select state and actions from the store
  const entry = store((state) => state.entry);
  const estLeverage = store((state) => state.estLeverage);
  const estLiquidationPrice = store((state) => state.estLiquidationPrice);
  const errors = store((state) => state.errors);
  const actions = store((state) => state.actions);

  return {
    entry,
    estLeverage,
    estLiquidationPrice,
    errors,
    actions,
  };
};
