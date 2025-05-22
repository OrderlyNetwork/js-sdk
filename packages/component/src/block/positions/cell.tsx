import { FC, useContext } from "react";
import { API } from "@orderly.network/types";
import Button from "@/button";
import { Coin, NetworkImage, PositionShareIcon } from "@/icon";
import { SymbolContext } from "@/provider";
import { Statistic } from "@/statistic";
import { Numeral, Text } from "@/text";
import { cn } from "@/utils/css";
import { SharePnLIcon } from "../shared/sharePnLIcon";
import { TPSLTriggerPrice } from "./tpslTriggerPrice";

interface PositionCellProps {
  onLimitClose?: (position: any) => void;
  onMarketClose?: (position: any) => void;
  onTPSLOrder?: (position: API.PositionTPSLExt, order?: API.AlgoOrder) => void;
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
    <div className="orderly-px-4">
      <div className="orderly-flex orderly-items-center orderly-py-2">
        <div className="orderly-flex-1">
          <div className="orderly-flex orderly-items-center orderly-space-x-2">
            <NetworkImage type="symbol" symbol={item.symbol} size={"small"} />
            <Text rule="symbol" onClick={onSymbol} className="orderly-text-3xs">
              {item.symbol}
            </Text>
          </div>
        </div>
        <Statistic
          labelClassName="orderly-text-3xs"
          label={
            <>
              <span className="orderly-text-base-contrast-36">Unreal. PnL</span>
              <span className="orderly-text-base-contrast-20">(USDC)</span>
            </>
          }
          value={
            <div
              className={cn(
                "orderly-flex orderly-justify-end orderly-text-2xs orderly-items-center orderly-gap-0.5",
                item["unrealized_pnl"] > 0
                  ? "orderly-text-trade-profit"
                  : item["unrealized_pnl"] < 0
                    ? "orderly-text-trade-loss"
                    : "orderly-text-base-contrast/50",
              )}
            >
              <Numeral>{item["unrealized_pnl"]}</Numeral>
              <Numeral
                rule="percentages"
                prefix="("
                surfix=")"
                className="orderly-text-4xs"
              >
                {item.unrealized_pnl_ROI}
              </Numeral>
              <SharePnLIcon className="orderly-ml-2" position={item} />
            </div>
          }
          rule="price"
          coloring
          align="right"
        />
      </div>
      <div className="orderly-grid orderly-grid-cols-3 orderly-gap-2">
        <Statistic
          label="Qty."
          labelClassName="orderly-text-3xs orderly-text-base-contrast-36"
          valueClassName="orderly-text-2xs"
          value={item["position_qty"]}
          coloring
          rule="price"
          precision={base_dp}
        />
        <Statistic
          rule="price"
          labelClassName="orderly-text-3xs"
          valueClassName="orderly-text-2xs"
          label={
            <>
              <span className="orderly-text-base-contrast-36">Margin</span>
              <span className="orderly-text-base-contrast-20">(USDC)</span>
            </>
          }
          value={item["mm"]}
        />
        <Statistic
          labelClassName="orderly-text-3xs"
          valueClassName="orderly-text-2xs"
          label={
            <>
              <span className="orderly-text-base-contrast-36">Notional</span>
              <span className="orderly-text-base-contrast-20">(USDC)</span>
            </>
          }
          rule="price"
          precision={base_dp}
          value={item["notional"]}
          align="right"
        />
        <Statistic
          labelClassName="orderly-text-3xs"
          valueClassName="orderly-text-2xs"
          label={
            <>
              <span className="orderly-text-base-contrast-36">Avg. open</span>
              {/* <span className="orderly-text-base-contrast-20">(USDC)</span> */}
            </>
          }
          rule="price"
          precision={quote_dp}
          value={item["average_open_price"]}
        />
        <Statistic
          labelClassName="orderly-text-3xs"
          valueClassName="orderly-text-2xs"
          label={
            <>
              <span className="orderly-text-base-contrast-36">Mark price</span>
              {/* <span className="orderly-text-base-contrast-20">(USDC)</span> */}
            </>
          }
          rule="price"
          precision={quote_dp}
          value={item["mark_price"]}
        />
        <Statistic
          labelClassName="orderly-text-3xs"
          label={
            <>
              <span className="orderly-text-base-contrast-36">Liq. price</span>
              {/* <span className="orderly-text-base-contrast-20">(USDC)</span> */}
            </>
          }
          valueClassName="orderly-text-warning orderly-text-2xs"
          value={item["est_liq_price"] === 0 ? "--" : item["est_liq_price"]}
          align="right"
          rule="price"
          precision={quote_dp}
        />
      </div>
      <TPSLTriggerPrice
        stopLossPrice={item.sl_trigger_price}
        takeProfitPrice={item.tp_trigger_price}
        quote_dp={quote_dp}
      />
      <div className="orderly-flex orderly-justify-end orderly-items-center orderly-gap-2 orderly-py-2">
        <Button
          variant={"outlined"}
          size={"small"}
          color={"tertiary"}
          onClick={() => props.onTPSLOrder?.(props.item, props.item.algo_order)}
          className="orderly-flex-1 orderly-h-[28px] orderly-text-base-contrast-54 orderly-text-3xs"
        >
          TP / SL
        </Button>
        <Button
          id="orderly-position-cell-limit-close-button"
          variant={"outlined"}
          size={"small"}
          color={"tertiary"}
          onClick={() => props.onLimitClose?.(props.item)}
          className="orderly-flex-1 orderly-h-[28px] orderly-text-base-contrast-54 orderly-text-3xs"
        >
          Limit close
        </Button>
        <Button
          id="orderly-position-cell-mark-close-button"
          variant={"outlined"}
          size={"small"}
          color={"tertiary"}
          onClick={() => props.onMarketClose?.(props.item)}
          className="orderly-flex-1 orderly-h-[28px] orderly-text-base-contrast-54 orderly-text-3xs"
        >
          Market close
        </Button>
      </div>
    </div>
  );
};
