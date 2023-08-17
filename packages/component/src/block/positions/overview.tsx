import Button from "@/button";
import { Select } from "@/select";
import { Statistic } from "@/statistic";
import { FC } from "react";
import { modal } from "@/modal";

interface OverviewProps {
  onMarketCloseAll?: () => void;
  canCloseAll?: boolean;
}

export const Overview: FC<OverviewProps> = (props) => {
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
      <div className="flex justify-between bg-base-200 p-3">
        <Statistic label="Unreal PnL" value="-1,234.56" coloring />
        <Statistic label="Notional" value="123456" rule="price" />
        <Statistic
          label="Unsettled PnL"
          value="123,456"
          coloring
          align="right"
        />
      </div>
      <div className="flex justify-between py-3 px-3 items-center">
        <div>Show all instruments</div>
        <Button
          variant={"outlined"}
          size={"small"}
          color={"tertiary"}
          onClick={() => onMarketCloseAll()}
        >
          Market Close All
        </Button>
      </div>
    </>
  );
};
