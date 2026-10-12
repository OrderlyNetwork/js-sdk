import React, { forwardRef } from "react";
import { OrderSide, OrderStatus, API } from "@orderly.network/types";
import type { DataFilterItem } from "@orderly.network/ui";
import { SharePnLConfig } from "@orderly.network/ui-share";
import { TabType } from "../orders.widget";
import { OrderListInstance, useOrderListScript } from "./orderList.script";
import { DesktopOrderList, MobileOrderList } from "./orderList.ui";

export type DesktopOrderListWidgetProps = {
  type: TabType;
  ordersStatus?: OrderStatus;
  /** if has value, will be fetch current symbol orders*/
  symbol?: string;
  /**
   * Read-side product filter ("PERP"/"BINARY"). PERP also strips Binary WS
   * inserts and cancels pending orders by symbols in the loaded display stream;
   * filtered or incomplete streams can miss symbols. DELETE has no product
   * filter: BINARY without a symbol still cancels account-wide, including PERP.
   * Do not rely on this prop alone for BINARY cancellation isolation.
   */
  productType?: string;
  onSymbolChange?: (symbol: API.Symbol) => void;
  pnlNotionalDecimalPrecision?: number;
  sharePnLConfig?: SharePnLConfig;
  testIds?: {
    tableBody?: string;
  };
  additionalFilterItems?: DataFilterItem[];
  onAdditionalFilter?: (filter: { name: string; value: unknown }) => void;
};

export const DesktopOrderListWidget = forwardRef<
  OrderListInstance,
  DesktopOrderListWidgetProps
>((props, ref) => {
  const { testIds, additionalFilterItems, onAdditionalFilter, ...rest } = props;
  const state = useOrderListScript({ ...rest, ref });
  return (
    <DesktopOrderList
      {...state}
      testIds={testIds}
      additionalFilterItems={additionalFilterItems}
      onAdditionalFilter={onAdditionalFilter}
    />
  );
});

export const MobileOrderListWidget: React.FC<{
  type: TabType;
  ordersStatus?: OrderStatus;
  /** if has value, will be fetch current symbol orders*/
  symbol?: string;
  /**
   * Read-side product filter ("PERP"/"BINARY"). PERP also strips Binary WS
   * inserts and cancels pending orders by symbols in the loaded display stream;
   * filtered or incomplete streams can miss symbols. DELETE has no product
   * filter: BINARY without a symbol still cancels account-wide, including PERP.
   * Do not rely on this prop alone for BINARY cancellation isolation.
   */
  productType?: string;
  onSymbolChange?: (symbol: API.Symbol) => void;
  sharePnLConfig?: SharePnLConfig;
  classNames?: { root?: string; cell?: string; content?: string };
  showFilter?: boolean;
  filterConfig?: {
    side?: OrderSide | "all";
    range?: { from?: Date; to?: Date };
  };
}> = (props) => {
  const state = useOrderListScript({ ...props, enableLoadMore: true });
  return (
    <MobileOrderList
      {...state}
      classNames={props.classNames}
      showFilter={props.showFilter}
    />
  );
};
