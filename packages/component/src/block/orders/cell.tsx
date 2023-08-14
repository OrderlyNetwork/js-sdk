import Button from "@/button";
import { Statistic } from "@/statistic";
import { Tag } from "@/tag";
import { FC, useMemo } from "react";

interface OrderCellProps {
  order: any;
  onCancel?: (order: any) => void;
  onEdit?: (order: any) => void;
}

export const OrderCell: FC<OrderCellProps> = (props) => {
  const { order } = props;
  const typeTag = useMemo(() => {
    return (
      <Tag color="buy" size="small">
        Buy
      </Tag>
    );
  }, [order]);
  return (
    <>
      <div className="flex item-center gap-2">
        {typeTag}
        <div className="flex-1">BTC-PERP</div>
        <div>2022-08-30 17:19:47</div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Statistic label="Qty." value={order.quantity ?? "-"} coloring />
        <Statistic label="Filled" value={order.executed ?? "-"} />
        <Statistic label="Margin(USDC)" value="1,000.00" align="right" />
        <Statistic label="Limit Price(USDC)" value={order.price ?? "-"} />
        <Statistic label="Mark Price(USDC)" value="30,000.00" />
      </div>
      <div className="flex gap-2 py-2">
        <Button
          fullWidth
          variant="outlined"
          size="small"
          onClick={() => props.onEdit?.(order)}
        >
          Edit
        </Button>
        <Button
          fullWidth
          variant="outlined"
          size="small"
          onClick={() => props.onCancel?.(order)}
        >
          Cancel
        </Button>
      </div>
    </>
  );
};
