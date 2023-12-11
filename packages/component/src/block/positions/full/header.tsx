import Button from "@/button";
import { Statistic } from "@/statistic";
import { AggregatedData } from "@/block/positions/overview";
import { FC } from "react";
import { StatisticStyleProvider } from "@/statistic/defaultStaticStyle";
import { Numeral } from "@/text";
import { cn } from "@/utils/css";
import { RefreshCcw } from "lucide-react";
import { Checkbox } from "@/checkbox";
import { Label } from "@/label";

interface Props {
  onMarketCloseAll?: () => void;
  canCloseAll?: boolean;

  aggregated?: AggregatedData;

  showAllSymbol?: boolean;
  onShowAllSymbolChange?: (value: boolean) => void;
}

export const Header: FC<Props> = (props) => {
  const unrealPnL = props.aggregated?.unrealPnL ?? 0;
  return (
    <StatisticStyleProvider
      labelClassName="orderly-text-3xs orderly-text-base-contrast-54"
      valueClassName="orderly-text-base-contrast/80 orderly-tabular-nums"
    >
      <div
        className={
          "orderly-flex orderly-justify-between orderly-py-3 orderly-items-center"
        }
      >
        <div className={"orderly-flex orderly-space-x-6"}>
          <Statistic
            label={"Unreal.PnL"}
            value={
              <div
                className={cn("orderly-flex orderly-gap-1", {
                  "orderly-text-trade-loss": unrealPnL < 0,
                  "orderly-text-trade-profit": unrealPnL > 0,
                })}
              >
                <Numeral>{unrealPnL}</Numeral>
                <Numeral
                  rule="percentages"
                  prefix={"("}
                  surfix={")"}
                  className={"orderly-ml-1"}
                >
                  {props.aggregated?.unrealPnlROI ?? 0}
                </Numeral>
              </div>
            }
            rule="price"
            coloring
          />
          <Statistic label={"Daily Real."} value={0} rule="price" coloring />
          <Statistic
            label={"Notional"}
            value={props.aggregated?.notional}
            rule="price"
          />
          <Statistic
            label={"Unsettled Pnl"}
            // value={props.aggregated?.unsettledPnL}
            coloring
            value={
              <div
                className={"orderly-flex orderly-items-center orderly-gap-1"}
              >
                <Numeral showIcon coloring>
                  {props.aggregated?.unsettledPnL ?? 0}
                </Numeral>
                <button className={"orderly-text-primary-light"}>
                  {/*@ts-ignore*/}
                  <RefreshCcw size={14} />
                </button>
              </div>
            }
            rule="price"
          />
        </div>
        <div className={"orderly-flex orderly-items-center orderly-gap-2"}>
          <Checkbox
            id={"showCloseTrades"}
            // checked={props.showAllSymbol}
            // onCheckedChange={props.onShowAllSymbolChange}
          />
          <Label
            htmlFor={"showCloseTrades"}
            className="orderly-text-base-contrast-54 orderly-text-3xs"
          >
            Show close trades
          </Label>
        </div>
      </div>
    </StatisticStyleProvider>
  );
};
