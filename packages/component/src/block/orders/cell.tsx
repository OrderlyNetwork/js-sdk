import Button from "@/button";
import { Statistic } from "@/statistic";
import { Tag } from "@/tag";
import { FC, useCallback, useContext, useMemo, useState } from "react";
import { Numeral } from "@/text/numeral";
import { API, OrderSide } from "@orderly.network/types";
import { Text } from "@/text";
import { NumeralTotal } from "@/text/numeralTotal";
import { OrderListContext } from "./shared/orderListContext";
import { SymbolContext } from "@/provider";
import { AlgoOrderRootType } from "@orderly.network/types";
import { utils } from "@orderly.network/hooks";
import { useTPSLOrderRowContext } from "../tp_sl/tpslOrderRowContext";
import { TPSLOrderTag } from "./orderTPSLTag";
import { RegularCell } from "./cell.regular";
import { TPSLCell } from "./cell.tpsl";

interface OrderCellProps {
  order: API.OrderExt | API.AlgoOrderExt;
  onSymbolChange?: (symbol: API.Symbol) => void;
}

export const OrderCell: FC<OrderCellProps> = (props) => {
  const { order } = props;
  const [loading, setLoading] = useState(false);

  const { onCancelOrder, onEditOrder } = useContext(OrderListContext);
  const { quote, quote_dp, base, base_dp } = useContext(SymbolContext);
  const { position } = useTPSLOrderRowContext();

  const typeTag = useMemo(() => {
    return (
      <Tag color={order.side === "BUY" ? "buy" : "sell"}>
        {order.side === "BUY" ? "Buy" : "Sell"}
      </Tag>
    );
  }, [order]);

  const cancelOrder = useCallback(() => {
    if (loading) return;
    setLoading(true);
    onCancelOrder(order).finally(() => setLoading(false));
  }, [loading, order]);

  const onSymbol = () => {
    props.onSymbolChange?.({ symbol: order.symbol } as API.Symbol);
    // go to the top of page
    window.scrollTo(0, 0);
  };

  const infoEle = useMemo(() => {
    if (
      "algo_type" in order &&
      (order.algo_type === AlgoOrderRootType.TP_SL ||
        order.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL)
    ) {
      return <TPSLCell order={order} base_dp={base_dp} quote_dp={quote_dp} />;
    }
    return (
      <RegularCell
        order={order as API.OrderExt}
        base_dp={base_dp}
        quote_dp={quote_dp}
      />
    );
  }, [order, base_dp, quote_dp]);

  return (
    <div className="orderly-px-4 orderly-py-3">
      <div className="orderly-mb-1 orderly-flex orderly-items-end orderly-justify-between">
        <div className="orderly-flex-col">
          <div className="orderly-flex orderly-items-center orderly-gap-2 ">
            {typeTag}
            <div className="orderly-flex-1 orderly-text-2xs" onClick={onSymbol}>
              <Text rule="symbol">{order.symbol}</Text>
            </div>
          </div>
          <TPSLOrderTag order={order} />
        </div>
        <div className="orderly-text-3xs orderly-text-base-contrast-36">
          <Text rule="date">{order.created_time}</Text>
        </div>
      </div>
      <div className="orderly-grid orderly-grid-cols-3 orderly-gap-2 orderly-py-1">
        {infoEle}
      </div>
      <div className="orderly-flex orderly-gap-3 orderly-text-4xs orderly-justify-end orderly-mt-2">
        <Button
          id="orderly-pending-cell-edit-button"
          variant="outlined"
          size="small"
          color="tertiary"
          className="orderly-w-[120px] orderly-text-3xs orderly-text-base-contrast-36"
          onClick={() => onEditOrder(order, position)}
        >
          Edit
        </Button>
        <Button
          id="orderly-pending-cell-cancel-button"
          variant="outlined"
          color="tertiary"
          size="small"
          className="orderly-w-[120px] orderly-text-3xs orderly-text-base-contrast-36"
          loading={loading}
          onClick={cancelOrder}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
