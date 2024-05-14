import { SettingsOutlineIcon } from "@/icon/icons/settings-outline";
import { Tooltip } from "@/tooltip";
import { IndicatorIcon } from "@/icon/icons/indicator";
import React, { useState } from "react";
import LineTypeSelect from "@/page/trading/desktop/myTradingview/lineTypeSelect";
import TimeInterval from "@/page/trading/desktop/myTradingview/timeInterval";
import DisplayControl from "@/page/trading/desktop/myTradingview/displayControl";
import { DisplayControlSettingInterface } from "@orderly.network/trading-view";

interface IProps {
  changeInterval: (interval: string) => void;
  openSettingDialog: () => void;
  openIndicatorsDialog: () => void;
  changeLineType: (type: string) => void;
  interval: string;
  lineType: string;
  displayControlState: DisplayControlSettingInterface;
  changeDisplaySetting: (state: DisplayControlSettingInterface) => void;
}

export default function TopBar({
  changeInterval,
  openSettingDialog,
  changeDisplaySetting,
  openIndicatorsDialog,
  changeLineType,
  interval,
  lineType,
  displayControlState,
}: IProps) {
  return (
    <div className="top-toolbar orderly-flex orderly-h-[50px] orderly-justify-between orderly-items-center orderly-px-4 orderly-border-b-[1px] orderly-border-base-contrast-8">
      <div className="orderly-flex orderly-gap-2 orderly-justify-start orderly-items-center">
        <TimeInterval
          timeInterval={interval}
          changeTimeInterval={changeInterval}
        />

        <DisplayControl
          displayControlState={displayControlState}
          changeDisplayControlState={changeDisplaySetting}
        />
        <Tooltip content="Indicators" className="orderly-max-w-[200px]">
          <button
            className="orderly-text-base-contrast-54 hover:orderly-text-base-contrast"
            onClick={() => openIndicatorsDialog()}
          >
            <IndicatorIcon size={20} fill="currentColor" />
          </button>
        </Tooltip>
        <LineTypeSelect lineType={lineType} changeLineType={changeLineType} />
        <Tooltip content="Setting" className="orderly-max-w-[200px]">
          <button
            className="orderly-text-base-contrast-54 hover:orderly-text-base-contrast"
            onClick={() => openSettingDialog()}
          >
            <SettingsOutlineIcon fill="currentColor" size={20} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
