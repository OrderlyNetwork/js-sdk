import Button from "@/button";
import { Coin } from "@/icon";
import { Statistic } from "@/statistic";
import { FC } from "react";

interface PositionCellProps {
  onLimitClose?: (position: any) => void;
  onMarketClose?: (position: any) => void;

  item: any;
}

export const PositionCell: FC<PositionCellProps> = (props) => {
  const { item } = props;
  return (
    <div>
      <div className="flex items-center py-2">
        <div className="flex-1 text-lg">
          <div className="flex items-center">
            <Coin name="BTC" />
            <span className="ml-2">BTC-PERP</span>
          </div>
        </div>
        <Statistic label="Total PnL" value="123456" coloring align="right" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Statistic label="Qty." value={item["position_qty"]} coloring />
        <Statistic
          label={
            <div>
              <span>Margin</span>
              <span>(USDC)</span>
            </div>
          }
          value="123456"
        />
        <Statistic
          label={
            <div>
              <span>Notional</span>
              <span>(USDC)</span>
            </div>
          }
          value="123456"
          align="right"
        />
        <Statistic
          label={
            <div>
              <span>Avg. Open</span>
              <span>(USDC)</span>
            </div>
          }
          value={item["average_open_price"]}
        />
        <Statistic
          label={
            <div>
              <span>Mark Price</span>
              <span>(USDC)</span>
            </div>
          }
          value={item["mark_price"]}
        />
        <Statistic
          label={
            <div>
              <span>Liq.Price</span>
              <span>(USDC)</span>
            </div>
          }
          value={item["est_liq_price"]}
          coloring
          align="right"
        />
      </div>
      <div className="flex justify-end items-center gap-2 py-2">
        <Button
          variant={"outlined"}
          size={"small"}
          onClick={() => props.onLimitClose?.(props.item)}
        >
          Limit close
        </Button>
        <Button
          variant={"outlined"}
          size={"small"}
          onClick={() => props.onMarketClose?.(props.item)}
        >
          Market close
        </Button>
      </div>
    </div>
  );
};
