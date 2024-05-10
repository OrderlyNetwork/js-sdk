import React, { useState } from "react";
import { DisplayControlSettingInterface } from "@orderly.network/trading-view";
import TimeInterval from "./timeInterval";
import DisplayControl from "./displayControl";
import { cn } from "@/utils";

interface IProps {
  changeInterval: (interval: string) => void;
  interval: string;
  displayControlState: DisplayControlSettingInterface;
  changeDisplaySetting: (state: DisplayControlSettingInterface) => void;
}

const defaultIntervalMap = [
  {
    value: "1",
    label: "1m",
  },
  {
    value: "15",
    label: "15m",
  },
  {
    value: "60",
    label: "1h",
  },
  {
    value: "240",
    label: "4h",
  },
  {
    value: "1D",
    label: "1D",
  },

  {
    value: "1W",
    label: "1W",
  },
];

export default function TopBar({
  changeInterval,
  changeDisplaySetting,
  interval,
  displayControlState,
}: IProps) {
  return (
    <div className="top-toolbar orderly-relative orderly-flex orderly-h-[36px] orderly-text-base-contrast-54 orderly-justify-between orderly-items-center orderly-px-4 orderly-border-b-[1px] orderly-border-base-contrast-8">
      {defaultIntervalMap.map((item) => (
        <div
          className={cn(
            "orderly-text-2xs orderly-cursor-pointer",
            interval === item.value && "orderly-text-base-contrast"
          )}
          id={item.value}
          onClick={() => changeInterval(item.value)}
        >
          {item.label}
        </div>
      ))}
      <TimeInterval
        timeInterval={interval}
        changeTimeInterval={changeInterval}
      />

      <DisplayControl
        displayControlState={displayControlState}
        changeDisplayControlState={changeDisplaySetting}
      />
    </div>
  );
}
