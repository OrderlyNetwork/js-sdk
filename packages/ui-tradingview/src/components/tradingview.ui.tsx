import React, {
  FC,
  forwardRef,
  PropsWithChildren,
  ReactNode,
  SVGProps,
  useRef,
} from "react";
import { useMediaQuery } from "@orderly.network/hooks";
import { MEDIA_TABLET } from "@orderly.network/types";
import { Box, Button, cn, Divider, Flex, Text } from "@orderly.network/ui";
import { IndicatorsIcon, LineTypeIcon, SettingIcon } from "../icons";
import { TradingviewUIPropsInterface } from "../type";
import { MobileDisplayControl, DesktopDisplayControl } from "./displayControl";
import LineType from "./lineType";
import { NoTradingview } from "./noTradingview";
import { TimeInterval } from "./timeInterval";
import TopBar from "./topBar";

const OperateButton = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) => {
  return (
    <Box
      onClick={onClick}
      className="oui-cursor-pointer oui-w-[18px] oui-h-[18px] oui-text-base-contrast-36  hover:oui-text-base-contrast-80"
    >
      {children}
    </Box>
  );
};

export const ZoomOutIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="currentColor"
      {...props}
    >
      <path d="M15.0008 2.24304C14.8088 2.24304 14.6085 2.30755 14.4615 2.4538L11.2508 5.66455V3.74304H9.75079V7.49304C9.75079 7.90704 10.0868 8.24304 10.5008 8.24304H14.2508V6.74304H12.3285L15.54 3.53229C15.8325 3.23904 15.8325 2.74705 15.54 2.4538C15.393 2.30755 15.1928 2.24304 15.0008 2.24304ZM3.7508 9.74303V11.243H5.67231L2.46156 14.4538C2.16906 14.747 2.16906 15.239 2.46156 15.5323C2.75481 15.8248 3.2468 15.8248 3.54005 15.5323L6.7508 12.3215V14.243H8.25079V10.493C8.25079 10.079 7.9148 9.74303 7.5008 9.74303H3.7508Z" />
    </svg>
  );
};

export const ZoomInIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="currentColor"
      {...props}
    >
      <path d="M7.49219 9.74304C7.30026 9.74304 7.09964 9.80755 6.95309 9.9538L3.74219 13.1646V11.243H2.24219V14.993C2.24219 15.407 2.57796 15.743 2.99219 15.743H6.74219V14.243H4.82031L8.03121 11.0323C8.32416 10.739 8.32416 10.247 8.03121 9.9538C7.88481 9.80755 7.68404 9.74304 7.49219 9.74304ZM11.2509 2.24304V3.74304H13.1728L9.96186 6.9538C9.66899 7.24705 9.66899 7.73904 9.96186 8.03229C10.2547 8.32479 10.7471 8.32479 11.04 8.03229L14.2509 4.82153V6.74304H15.7509V2.99304C15.7509 2.57904 15.4151 2.24304 15.0009 2.24304H11.2509Z" />
    </svg>
  );
};

export const TradingviewUi = forwardRef<
  HTMLDivElement,
  TradingviewUIPropsInterface
>((props, ref) => {
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
    onFullScreenChange,
  } = props;

  const isMobile = useMediaQuery(MEDIA_TABLET);

  return (
    <div
      ref={ref}
      className={cn("oui-relative oui-size-full", props.classNames?.root)}
    >
      {!tradingViewScriptSrc ? (
        <NoTradingview />
      ) : (
        <div
          className={cn(
            "oui-z-[1] oui-absolute oui-top-0 oui-bottom-0 oui-right-0 oui-left-0 oui-flex oui-flex-col",
            props.classNames?.content,
          )}
        >
          <TopBar>
            {isMobile ? (
              <Flex
                gapX={2}
                width="100%"
                justify="between"
                className="oui-hide-scrollbar oui-overflow-x-scroll"
              >
                <TimeInterval
                  interval={interval ?? "15"}
                  changeInterval={changeInterval}
                />
                <MobileDisplayControl
                  displayControlState={displayControlState}
                  changeDisplayControlState={changeDisplaySetting}
                />
              </Flex>
            ) : (
              <Flex justify={"between"} itemAlign={"center"} width={"100%"}>
                <Flex>
                  <TimeInterval
                    interval={interval ?? "1"}
                    changeInterval={changeInterval}
                  />
                  <Divider
                    direction="vertical"
                    className="oui-h-4"
                    mx={2}
                    intensity={8}
                  />
                  <Flex justify="start" itemAlign="center" gap={2}>
                    <DesktopDisplayControl
                      displayControlState={displayControlState}
                      changeDisplayControlState={changeDisplaySetting}
                    />
                    <OperateButton onClick={openChartIndicators}>
                      <IndicatorsIcon />
                    </OperateButton>
                    <LineType
                      lineType={lineType}
                      changeLineType={changeLineType}
                    />
                    <OperateButton onClick={openChartSetting}>
                      <SettingIcon />
                    </OperateButton>
                  </Flex>
                </Flex>
                <Flex>
                  {props.fullscreen ? (
                    <ZoomOutIcon
                      className="oui-text-base-contrast-54 hover:oui-text-base-contrast oui-cursor-pointer"
                      onClick={onFullScreenChange}
                    />
                  ) : (
                    <ZoomInIcon
                      className="oui-text-base-contrast-54 hover:oui-text-base-contrast oui-cursor-pointer"
                      onClick={onFullScreenChange}
                    />
                  )}
                </Flex>
              </Flex>
            )}
          </TopBar>
          <div
            className="oui-h-full oui-w-full oui-overflow-hidden"
            ref={chartRef}
          />
        </div>
      )}
    </div>
  );
});
