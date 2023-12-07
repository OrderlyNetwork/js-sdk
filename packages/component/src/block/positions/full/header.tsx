import Button from "@/button";
import { Statistic } from "@/statistic";
import { AggregatedData } from "@/block/positions/overview";
import { FC } from "react";
import { StatisticStyleProvider } from "@/statistic/defaultStaticStyle";
import { Numeral } from "@/text";
import { cn } from "@/utils/css";

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
      valueClassName="orderly-text-base-contrast/80"
    >
      <div
        className={
          "orderly-flex orderly-justify-between orderly-py-2 orderly-items-center"
        }
      >
        <div className={"orderly-flex orderly-space-x-5"}>
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
        </div>
        {/* <Button
          variant={"outlined"}
          size={"small"}
          color={"tertiary"}
          className={"orderly-w-[240px]"}
        >
          Market close all
        </Button> */}
      </div>
    </StatisticStyleProvider>
  );
};
