import Button from "@/button";
import { Statistic } from "@/statistic";
import { AggregatedData } from "@/block/positions/overview";
import { FC } from "react";

interface Props {
  onMarketCloseAll?: () => void;
  canCloseAll?: boolean;

  aggregated?: AggregatedData;

  showAllSymbol?: boolean;
  onShowAllSymbolChange?: (value: boolean) => void;
}

export const Header: FC<Props> = (props) => {
  return (
    <div className={"orderly-flex orderly-justify-between"}>
      <div className={"orderly-flex orderly-space-x-5"}>
        <Statistic label={"Unreal.PnL"} value={2789312} />
        <Statistic label={"Daily Real."} value={2789312} />
        <Statistic label={"Notional"} value={2789312} />
      </div>
      <Button variant={"outlined"} className={"orderly-w-[240px]"}>
        Market close all
      </Button>
    </div>
  );
};
