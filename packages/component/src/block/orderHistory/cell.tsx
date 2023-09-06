import { Statistic } from "@/statistic";
import { Tag } from "@/tag";
import { FC, useMemo } from "react";

interface HistoryCellProps {
  item: any;
}

export const Cell: FC<HistoryCellProps> = (props) => {
  const { item } = props;
  const typeTag = useMemo(() => {
    return (
      <Tag color="buy" size="small">
        Buy
      </Tag>
    );
  }, [props.item]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <div className="flex-1 flex items-center">
          {typeTag}
          <div className="px-2">BTC-PERP</div>
        </div>
        <div className={"text-sm text-base-contrast/30"}>
          2022-08-30 17:19:47
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Statistic label="Qty." value={item.quantity ?? "-"} coloring />
        <Statistic label="Filled" value={item.executed ?? "-"} />
        <Statistic label="Status" value="Filled" align="right" />
        <Statistic label="Limit Price(USDC)" value={item.price ?? "-"} />
        <Statistic label="Mark Price(USDC)" value="30,000.00" />
      </div>
    </div>
  );
};
