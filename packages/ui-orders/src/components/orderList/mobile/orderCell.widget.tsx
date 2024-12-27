import { API } from "@orderly.network/types";
import { useOrderCellScript } from "./orderCell.script";
import { OrderCell } from "./orderCell.ui";
import { TabType } from "../../orders.widget";
import { SharePnLConfig, SharePnLParams } from "@orderly.network/ui-share";

export const OrderCellWidget = (props: {
  item: API.AlgoOrderExt;
  index: number;
  className?: string;
  type: TabType;
  sharePnLConfig?: SharePnLConfig &
    Partial<Omit<SharePnLParams, "position" | "refCode" | "leverage">>;
  onSymbolChange?: (symbol: API.Symbol) => void;
}) => {
  const { className, ...rest } = props;

  const state = useOrderCellScript(rest);
  return <OrderCell {...state} className={className} />;
};
