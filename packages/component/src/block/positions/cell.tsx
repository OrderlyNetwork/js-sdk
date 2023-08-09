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
        <Statistic label="Qty." value="0.123" coloring />
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
              <span>Notional</span>
              <span>(USDC)</span>
            </div>
          }
          value="123456"
        />
        <Statistic
          label={
            <div>
              <span>Mark Price</span>
              <span>(USDC)</span>
            </div>
          }
          value="123456"
        />
        <Statistic
          label={
            <div>
              <span>Liq.Price</span>
              <span>(USDC)</span>
            </div>
          }
          value="123456"
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
