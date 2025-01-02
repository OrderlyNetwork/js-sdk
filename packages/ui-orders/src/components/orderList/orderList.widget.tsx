import { forwardRef } from "react";
import { OrderSide, OrderStatus, API } from "@orderly.network/types";
import { OrderListInstance, useOrderListScript } from "./orderList.script";
import { DesktopOrderList, MobileOrderList } from "./orderList.ui";
import { TabType } from "../orders.widget";
import { SharePnLConfig, SharePnLParams } from "@orderly.network/ui-share";

export type DesktopOrderListWidgetProps = {
  type: TabType;
  ordersStatus?: OrderStatus;
  /** if has value, will be fetch current symbol orders*/
  symbol?: string;
  onSymbolChange?: (symbol: API.Symbol) => void;
  pnlNotionalDecimalPrecision?: number;
  sharePnLConfig?: SharePnLConfig &
    Partial<Omit<SharePnLParams, "position" | "refCode" | "leverage">>;

  testIds?: {
    tableBody?: string;
  };
};

export const DesktopOrderListWidget = forwardRef<
  OrderListInstance,
  DesktopOrderListWidgetProps
>((props, ref) => {
  const { testIds, ...rest } = props;
  const state = useOrderListScript({ ...rest, ref });
  return <DesktopOrderList {...state} testIds={testIds} />;
});

export const MobileOrderListWidget = (props: {
  type: TabType;
  ordersStatus?: OrderStatus;
  /** if has value, will be fetch current symbol orders*/
  symbol?: string;
  onSymbolChange?: (symbol: API.Symbol) => void;
  sharePnLConfig?: SharePnLConfig &
    Partial<Omit<SharePnLParams, "position" | "refCode" | "leverage">>;
  classNames?: {
    root?: string;
    cell?: string;
    content?: string;
  };
  showFilter?: boolean;
  filterConfig?: {
    side?: OrderSide | "all";
    range?: {
      from?: Date;
      to?: Date;
    };
  };
}) => {
  const state = useOrderListScript({
    ...props,
    enableLoadMore: true,
  });
  return (
    <MobileOrderList
      {...state}
      classNames={props.classNames}
      showFilter={props.showFilter}
    />
  );
};
