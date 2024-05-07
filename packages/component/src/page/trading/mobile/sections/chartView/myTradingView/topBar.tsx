import React, { useState } from "react";
import { DisplayControlSettingInterface } from "@orderly.network/trading-view";
import TimeInterval from "./timeInterval";
import DisplayControl from "./displayControl";

interface IProps {
  changeInterval: (interval: string) => void;
  interval: string;
  displayControlState: DisplayControlSettingInterface;
  changeDisplaySetting: (state: DisplayControlSettingInterface) => void;
}

export default function TopBar({
  changeInterval,
  changeDisplaySetting,
  interval,
  displayControlState,
}: IProps) {
  return (
    <div className="top-toolbar orderly-relative orderly-flex orderly-h-[36px]  orderly-gap-[22px] orderly-justify-between orderly-items-center orderly-px-4 orderly-border-b-[1px] orderly-border-base-contrast-8">
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
