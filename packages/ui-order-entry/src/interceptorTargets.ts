/**
 * Module augmentation: maps OrderEntry interceptor target paths to props types.
 * Import from @orderly.network/ui-order-entry to enable typed props in
 * createInterceptor("Trading.OrderEntry.*", (Original, props, api) => ...).
 */
import type {
  OrderEntryBuySellSwitchProps,
  OrderEntryAvailableProps,
  OrderEntryQuantitySliderProps,
  OrderEntrySubmitSectionProps,
  OrderEntryTypeTabsProps,
} from "./components/orderEntry.injectabled";
import type { OrderEntryProps } from "./orderEntry.ui";

declare module "@orderly.network/plugin-core" {
  interface InterceptorTargetPropsMap {
    OrderEntry: OrderEntryProps;
    "Trading.OrderEntry.Available": OrderEntryAvailableProps;
    "Trading.OrderEntry.BuySellSwitch": OrderEntryBuySellSwitchProps;
    "Trading.OrderEntry.QuantitySlider": OrderEntryQuantitySliderProps;
    "Trading.OrderEntry.SubmitSection": OrderEntrySubmitSectionProps;
    "Trading.OrderEntry.TypeTabs": OrderEntryTypeTabsProps;
  }
}
