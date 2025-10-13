import { useMemo, useState } from "react";
import { utils } from "@kodiak-finance/orderly-hooks";
import { calcBracketRoiAndPnL } from "../../../../utils/util";
import { OrderCellState } from "../orderCell.script";

export const useBracketOrderPriceScript = (props: OrderCellState) => {
  const { item: order, quote_dp, base_dp } = props;

  const [open, setOpen] = useState(false);

  const { sl_trigger_price, tp_trigger_price } = useMemo(() => {
    if (!("algo_type" in order) || !Array.isArray(order.child_orders)) {
      return {};
    }
    return utils.findTPSLFromOrder(order.child_orders[0]);
  }, [order]);

  const { pnl, roi } = calcBracketRoiAndPnL(order);

  return {
    sl_trigger_price,
    order,
    tp_trigger_price,
    pnl,
    roi,
    quote_dp,
    open,
    setOpen,
  };
};

export type BracketOrderPriceState = ReturnType<
  typeof useBracketOrderPriceScript
>;
