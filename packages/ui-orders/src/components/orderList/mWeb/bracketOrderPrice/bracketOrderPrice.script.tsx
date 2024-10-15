import { FC, useMemo, useState } from "react";
import { OrderCellState } from "../orderCell.script";
import { useMarkPricesStream, utils } from "@orderly.network/hooks";

export const useBracketOrderPriceScript = (props: OrderCellState) => {
  const { item: order, quote_dp, base_dp } = props;

  const [open, setOpen] = useState(false);

  const markPrices = useMarkPricesStream();
  const markPrice = useMemo(() => {
    return markPrices.data[order.symbol];
  }, [markPrices.data[order.symbol]]);

  const { sl_trigger_price, tp_trigger_price } = useMemo(() => {
    if (!("algo_type" in order) || !Array.isArray(order.child_orders)) {
      return {};
    }
    return utils.findTPSLFromOrder(order.child_orders[0]);
  }, [order]);

  const pnl = useMemo(() => {
    const entryPrice = order.trigger_price ?? order.price;
    if (order?.algo_type && order?.algo_type === "BRACKET" && entryPrice && markPrice) {
      return utils.priceToPnl(
        {
          qty: order.quantity,
          price: markPrice,
          entryPrice: entryPrice,
          // @ts-ignore
          orderSide: order.side,
          // @ts-ignore
          orderType: order.algo_type,
        },
        {
          symbol: { quote_dp: quote_dp },
        }
      );
    }
    return undefined;
  }, [markPrice]);
  const roi = useMemo(() => {
    if (pnl) {
      return utils.calcTPSL_ROI({
        pnl: pnl,
        qty: order.quantity,
        price: markPrice,
      });
    }
    return undefined;
  }, [markPrice, pnl]);

  return {
    sl_trigger_price,
    tp_trigger_price,
    pnl,
    roi,
    quote_dp,
    open,
    setOpen,
  };
};

export type BarcketOrderPriceState = ReturnType<
  typeof useBracketOrderPriceScript
>;
