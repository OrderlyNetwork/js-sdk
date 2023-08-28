import Button from "@/button";
import { Statistic } from "@/statistic";
import { Tag } from "@/tag";
import { FC, useMemo } from "react";
import { Numeral } from "@/text/numeral";
import { API } from "@orderly/types";
// import {type Order} from '@orderly/core'

interface OrderCellProps {
  order: API.OrderExt;
  onCancel?: (order: any) => void;
  onEdit?: (order: any) => void;
}

export const OrderCell: FC<OrderCellProps> = (props) => {
  const { order } = props;
  const typeTag = useMemo(() => {
    return (
      <Tag color={order.side === "BUY" ? "buy" : "sell"} size="small">
        {order.side === "BUY" ? "Buy" : "Sell"}
      </Tag>
    );
  }, [order]);
  return (
    <div className={"p-4"}>
      <div className="flex items-center gap-2">
        {typeTag}
        <div className="flex-1">BTC-PERP</div>
        <div className={"text-sm text-base-contrast/30"}>
          2022-08-30 17:19:47
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Statistic label="Qty." value={order.quantity ?? "-"} coloring />
        <Statistic label="Filled" value={order.executed ?? "-"} />
        <Statistic
          label="Est.Total(USDC)"
          value={
            <Numeral.total
              price={props.order.price ?? 1}
              quantity={props.order.quantity}
            />
          }
          align="right"
        />
        <Statistic label="Limit Price(USDC)" value={order.price ?? "-"} />
        <Statistic label="Mark Price(USDC)" value={order.mark_price} />
      </div>
      <div className="flex gap-3 py-2">
        <Button
          fullWidth
          variant="outlined"
          size="small"
          color="tertiary"
          onClick={() => props.onEdit?.(order)}
        >
          Edit
        </Button>
        <Button
          fullWidth
          variant="outlined"
          color="tertiary"
          size="small"
          onClick={() => props.onCancel?.(order)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
