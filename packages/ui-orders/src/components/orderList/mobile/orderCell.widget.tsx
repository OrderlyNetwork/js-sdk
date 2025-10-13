import { API } from "@kodiak-finance/orderly-types";
import { useOrderCellScript } from "./orderCell.script";
import { OrderCell } from "./orderCell.ui";
import { TabType } from "../../orders.widget";
import { SharePnLConfig } from "@kodiak-finance/orderly-ui-share";

export const OrderCellWidget = (props: {
  item: API.AlgoOrderExt;
  index: number;
  className?: string;
  type: TabType;
  sharePnLConfig?: SharePnLConfig;
  onSymbolChange?: (symbol: API.Symbol) => void;
}) => {
  const { className, ...rest } = props;

  const state = useOrderCellScript(rest);
  return <OrderCell {...state} className={className} />;
};
