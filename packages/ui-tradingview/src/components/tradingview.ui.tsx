import React, { ReactNode, useRef } from "react";
import { TradingviewUIPropsInterface } from "../type";
import TopBar from "./topBar";
import TimeInterval from "./timeInterval";
import DisplayControl from "./displayControl";
import { NoTradingview } from "./noTradingview";
import { Box, Button, Divider, Flex } from "@orderly.network/ui";
import { IndicatorsIcon, LineTypeIcon, SettingIcon } from "../icons";
import LineType from "./lineType";

const OperateButton= ({children, onClick}: {children: ReactNode, onClick?: () => void;}) => {
 return (
  <Box onClick={onClick} className='oui-cursor-pointer oui-w-[18px] oui-h-[18px] oui-text-base-contrast-36  hover:oui-text-base-contrast-80'>
    {children}
  </Box>
 )
}

export function TradingviewUi(props: TradingviewUIPropsInterface) {
  const {
    chartRef,
    interval,
    changeDisplaySetting,
    displayControlState,
    tradingViewScriptSrc,
    changeInterval,
    lineType,
    changeLineType,
    openChartSetting,
    openChartIndicators,
  } = props;
  return (
    <div className="oui-h-full oui-w-full oui-min-h-[350px] oui-relative">
      {!tradingViewScriptSrc ? (
        <NoTradingview />
      ) : (
        <div className="oui-z-[1]">
          <TopBar>
            <TimeInterval
              interval={interval ?? "1"}
              changeInterval={changeInterval}
            />
            <Divider direction='vertical' className='oui-h-4' mx={2} intensity={8}/>
            <Flex justify='start' itemAlign="center" gap={2}>
              <DisplayControl
                displayControlState={displayControlState}
                changeDisplayControlState={changeDisplaySetting}
              />
              <OperateButton onClick={openChartIndicators}>
                <IndicatorsIcon/>
              </OperateButton>
              <LineType lineType={lineType} changeLineType={changeLineType}/>
              <OperateButton onClick={openChartSetting}>
                <SettingIcon />
              </OperateButton>
            </Flex>
          </TopBar>
          <div className="oui-h-full oui-w-full" ref={chartRef}></div>
        </div>
      )}
    </div>
  );
}
