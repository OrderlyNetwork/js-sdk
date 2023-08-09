import Button from "@/button";
import { Statistic } from "@/statistic";
import { Tag } from "@/tag";

export const OrderCell = () => {
  return (
    <>
      <div className="flex item-center gap-2">
        <Tag color="buy" size="small">
          Buy
        </Tag>
        <div className="flex-1">BTC-PERP</div>
        <div>2022-08-30 17:19:47</div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Statistic label="Qty." value="0.123" coloring />
        <Statistic label="Filled" value="0" />
        <Statistic label="Margin(USDC)" value="1,000.00" align="right" />
        <Statistic label="Limit Price(USDC)" value="30,000.00" />
        <Statistic label="Mark Price(USDC)" value="30,000.00" />
      </div>
      <div className="flex gap-2">
        <Button fullWidth variant="outlined" size="small">
          Edit
        </Button>
        <Button fullWidth variant="outlined" size="small">
          Cancel
        </Button>
      </div>
    </>
  );
};
