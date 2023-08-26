import Button from "@/button";
import { Coin, NetworkImage } from "@/icon";
import { Statistic } from "@/statistic";
import { FC } from "react";
import { Text } from "@/text";

interface PositionCellProps {
  onLimitClose?: (position: any) => void;
  onMarketClose?: (position: any) => void;

  item: any;
}

export const PositionCell: FC<PositionCellProps> = (props) => {
  const { item } = props;
  return (
    <div className="px-4">
      <div className="flex items-center py-2">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <NetworkImage type="coin" symbol={item.symbol} size={"small"} />
            <Text rule="symbol">{item.symbol}</Text>
          </div>
        </div>
        <Statistic
          label={
            <>
              <span>Unreal.PnL</span>
              <span>(USDC)</span>
            </>
          }
          value={item["unrealized_pnl"]}
          rule="price"
          coloring
          align="right"
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Statistic label="Qty." value={item["position_qty"]} coloring />
        <Statistic
          rule="price"
          label={
            <>
              <span>Margin</span>
              <span>(USDC)</span>
            </>
          }
          value="--"
        />
        <Statistic
          label={
            <>
              <span>Notional</span>
              <span>(USDC)</span>
            </>
          }
          rule="price"
          value={item["notional"]}
          align="right"
        />
        <Statistic
          label={
            <>
              <span>Avg. Open</span>
              <span>(USDC)</span>
            </>
          }
          value={item["average_open_price"]}
        />
        <Statistic
          label={
            <>
              <span>Mark Price</span>
              <span>(USDC)</span>
            </>
          }
          value={item["mark_price"]}
        />
        <Statistic
          label={
            <>
              <span>Liq.Price</span>
              <span>(USDC)</span>
            </>
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
          color={"tertiary"}
          onClick={() => props.onLimitClose?.(props.item)}
        >
          Limit close
        </Button>
        <Button
          variant={"outlined"}
          size={"small"}
          color={"tertiary"}
          onClick={() => props.onMarketClose?.(props.item)}
        >
          Market close
        </Button>
      </div>
    </div>
  );
};
