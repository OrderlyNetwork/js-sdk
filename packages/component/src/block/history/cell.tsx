import Button from "@/button";
import { Statistic } from "@/statistic";
import { Tag } from "@/tag";

export const HistoryCell = () => {
  return (
    <>
      <div className="flex items-center gap-2">
        <Tag color="buy" size="small">
          Buy
        </Tag>
        <div className="flex-1 text-lg">BTC-PERP</div>
        <div>2022-08-30 17:19:47</div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Statistic label="Qty." value="0.123" coloring />
        <Statistic label="Filled" value="0" />
        <Statistic label="Real.PnL(USDC)" value="1,000.00" align="right" />
        <Statistic label="Avg. Price(USDC)" value="30,000.00" />
        <Statistic label="Order Price(USDC)" value="30,000.00" />
        <Statistic label="Status" value="Filled" align="right" />
      </div>
    </>
  );
};
