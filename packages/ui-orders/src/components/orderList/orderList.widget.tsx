import { OrderSide, OrderStatus } from "@orderly.network/types";
import { useOrderListScript } from "./orderList.script";
import { DesktopOrderList, MobileOrderList } from "./orderList.ui";
import { TabType } from "../orders.widget";
import { API } from "@orderly.network/types";

export const DesktopOrderListWidget = (props: {
  type: TabType;
  ordersStatus?: OrderStatus;
  /** if has value, will be fetch current symbol orders*/
  symbol?: string;
  onSymbolChange?: (symbol: API.Symbol) => void;
  pnlNotionalDecimalPrecision?: number;
}) => {  
  const state = useOrderListScript(props);
  return <DesktopOrderList {...state} />;
};

export const MobileOrderListWidget = (props: {
  type: TabType;
  ordersStatus?: OrderStatus;
  /** if has value, will be fetch current symbol orders*/
  symbol?: string;
  onSymbolChange?: (symbol: API.Symbol) => void;
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
