import Button from "@/button";
import { Select } from "@/select";
import { Statistic } from "@/statistic";
import React, { type FC } from "react";
import { modal } from "@orderly.network/ui";
import { Checkbox } from "@/checkbox";
import { Label } from "@/label";

export type AggregatedData = {
  unsettledPnL: number;

  unrealPnL: number;
  unrealPnlROI: number;
  notional: number;
};

interface OverviewProps {
  onMarketCloseAll?: () => void;
  canCloseAll?: boolean;

  aggregated?: AggregatedData;

  showAllSymbol?: boolean;
  onShowAllSymbolChange?: (value: boolean) => void;
}

export const PositionOverview: FC<OverviewProps> = (props) => {
  const { aggregated } = props;
  const onMarketCloseAll = () => {
    modal
      .confirm({
        title: "Market Close All",
        content: "Are you sure you want to market close all positions?",
      })
      .then((res) => {
        if (res) {
          props.onMarketCloseAll?.();
        }
      });
  };
  return (
    <>
      <div
        id="orderly-data-list-positions-header"
        className="orderly-flex orderly-justify-between orderly-bg-base-900 orderly-px-4 orderly-pt-3"
      >
        <Statistic
          labelClassName="orderly-text-3xs orderly-text-base-contrast-36"
          valueClassName="orderly-text-xs"
          label="Unreal. PnL"
          value={aggregated?.unrealPnL}
          coloring
          rule="price"
        />
        <Statistic
          labelClassName="orderly-text-3xs orderly-text-base-contrast-36"
          valueClassName="orderly-text-xs"
          label="Notional"
          value={aggregated?.notional}
          rule="price"
        />
        <Statistic
          label=""
          labelClassName="orderly-text-3xs orderly-text-base-contrast-36"
          valueClassName="orderly-text-xs"
          value={<div />}
          rule="price"
          coloring
          align="right"
        />
      </div>
      <div className="orderly-data-list-filter orderly-flex orderly-justify-between orderly-py-3 orderly-px-4 orderly-items-center">
        <div className="orderly-flex orderly-items-center orderly-gap-1">
          <Checkbox
            id={"showAll"}
            checked={props.showAllSymbol}
            onCheckedChange={props.onShowAllSymbolChange}
          />
          <Label
            htmlFor={"showAll"}
            className="orderly-text-base-contrast-54 orderly-text-3xs"
          >
            Show all instruments
          </Label>
        </div>
        {/* <Button
          variant={"outlined"}
          size={"small"}
          color={"tertiary"}
          onClick={() => onMarketCloseAll()}
        >
          Market Close All
        </Button> */}
      </div>
    </>
  );
};
