import Button from "@/button";
import { Coin, NetworkImage } from "@/icon";
import { Statistic } from "@/statistic";
import { FC, useContext } from "react";
import { Numeral, Text } from "@/text";
import { SymbolContext } from "@/provider";
import { API } from "@orderly.network/types";
import { cn } from "@/utils/css";

interface PositionCellProps {
  onLimitClose?: (position: any) => void;
  onMarketClose?: (position: any) => void;
  item: any;
  onSymbolChange?: (symbol: API.Symbol) => void;
}

export const PositionCell: FC<PositionCellProps> = (props) => {
  const { item } = props;
  const { quote, quote_dp, base, base_dp } = useContext(SymbolContext);

  const onSymbol = () => {
    props.onSymbolChange?.({ symbol: item.symbol } as API.Symbol);
    // go to the top of page
    window.scrollTo(0, 0);
  };

  return (
    <div className="px-4">
      <div className="flex items-center py-2">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <NetworkImage type="symbol" symbol={item.symbol} size={"small"} />
            <Text rule="symbol" onClick={onSymbol}>
              {item.symbol}
            </Text>
          </div>
        </div>
        <Statistic
          label={
            <>
              <span>Unreal.PnL</span>
              <span>(USDC)</span>
            </>
          }
          value={
            <div
              className={cn(
                "flex justify-end",
                item["unrealized_pnl"] > 0
                  ? "text-trade-profit"
                  : item["unrealized_pnl"] < 0
                  ? "text-trade-loss"
                  : "text-base-contrast/50"
              )}
            >
              <Numeral>{item["unrealized_pnl"]}</Numeral>
              <Numeral rule="percentages" prefix="(" surfix=")">
                {item.unsettled_pnl_ROI}
              </Numeral>
            </div>
          }
          rule="price"
          coloring
          align="right"
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Statistic
          label="Qty."
          value={item["position_qty"]}
          coloring
          rule="price"
          precision={base_dp}
        />
        <Statistic
          rule="price"
          label={
            <>
              <span>Margin</span>
              <span>(USDC)</span>
            </>
          }
          value={item["mm"]}
        />
        <Statistic
          label={
            <>
              <span>Notional</span>
              <span>(USDC)</span>
            </>
          }
          rule="price"
          precision={base_dp}
          value={item["notional"]}
          align="right"
        />
        <Statistic
          label={
            <>
              <span>Avg. open</span>
              <span>(USDC)</span>
            </>
          }
          rule="price"
          precision={quote_dp}
          value={item["average_open_price"]}
        />
        <Statistic
          label={
            <>
              <span>Mark price</span>
              <span>(USDC)</span>
            </>
          }
          rule="price"
          precision={quote_dp}
          value={item["mark_price"]}
        />
        <Statistic
          label={
            <>
              <span>Liq. price</span>
              <span>(USDC)</span>
            </>
          }
          valueClassName="text-warning"
          value={item["est_liq_price"] === 0 ? "--" : item["est_liq_price"]}
          align="right"
          rule="price"
          precision={quote_dp}
        />
      </div>
      <div className="flex justify-end items-center gap-2 py-2">
        <Button
          variant={"outlined"}
          size={"small"}
          color={"tertiary"}
          onClick={() => props.onLimitClose?.(props.item)}
          className="w-[120px] h-[28px]"
        >
          Limit close
        </Button>
        <Button
          variant={"outlined"}
          size={"small"}
          color={"tertiary"}
          onClick={() => props.onMarketClose?.(props.item)}
          className="w-[120px] h-[28px]"
        >
          Market close
        </Button>
      </div>
    </div>
  );
};
