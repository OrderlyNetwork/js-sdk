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
      <div className="flex justify-between">
        <Statistic label="Unreal PnL" value="-1,234.56" coloring />
        <Statistic label="Notional" value="123,456" />
        <Statistic
          label="Unsettled PnL"
          value="123,456"
          coloring
          align="right"
        />
      </div>
      <div className="flex justify-between py-2 items-center">
        <Select size={"small"} options={[]} value={"All side"} />
        <Button
          variant={"outlined"}
          size={"small"}
          onClick={() => onMarketCloseAll()}
        >
          Market Close All
        </Button>
      </div>
    </>
  );
};
