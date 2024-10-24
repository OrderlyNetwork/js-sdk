import React, { FC } from "react";
import {
  Flex,
  Text,
  Box,
  Tooltip,
  modal,
  gradientTextVariants,
  cn,
  EditIcon,
} from "@orderly.network/ui";
import { RiskRateState } from "./riskRate.script";
// import { Pencil } from "lucide-react";
import { LeverageWidgetId } from "@orderly.network/ui-leverage";
import { TooltipContent } from "../assetView/assetView.ui";

export const RiskRate: FC<RiskRateState> = (props) => {
  const { riskRate, riskRateColor, isConnected, currentLeverage, maxLeverage } =
    props;
  const { isHigh, isMedium, isLow, isDefault } = riskRateColor;

  const textColor = isHigh
    ? "oui-text-danger"
    : isMedium
    ? "oui-text-warning"
    : isLow
    ? gradientTextVariants({ color: "brand" })
    : "";

  return (
    <Box data-risk={""} className="oui-space-y-2">
      <Flex
        itemAlign="center"
        justify="start"
        className="oui-w-full oui-bg-base-6 oui-rounded-full oui-h-2 oui-px-[1px]"
      >
        {isDefault ? (
          <Box
            className="oui-bg-gradient-to-r oui-opacity-20 oui-from-[#26fefe]  oui-via-[#ff7d00] oui-to-[#d92d6b] oui-h-1.5 oui-rounded-full"
            style={{ width: "100%" }}
          />
        ) : null}

        {isHigh ? (
          <Box
            className="oui-bg-gradient-to-tr oui-from-[#791438] oui-to-[#ff447c] oui-h-1.5 oui-rounded-full"
            style={{ width: riskRate }}
          />
        ) : null}

        {isMedium ? (
          <Box
            className="oui-bg-gradient-to-tr oui-from-[#792e00] oui-to-[#ffb65d] oui-h-1.5 oui-rounded-full"
            style={{ width: riskRate }}
          />
        ) : null}

        {isLow ? (
          <Box
            className="oui-bg-gradient-to-tr oui-from-[#59b0fe] oui-to-[#26fefe] oui-h-1.5 oui-rounded-full"
            style={{ width: riskRate }}
          />
        ) : null}
      </Flex>

      <Flex className="oui-gap-2">
        <Flex direction="column" itemAlign="start" className="oui-flex-1">
          <Tooltip
            content={
              (
                <TooltipContent
                  description="The Risk rate is used to assess the risk level of an account. When the Risk rate reaches 100%, the account will be liquidated"
                  formula="Risk rate = Maintenance margin ratio / Margin ratio * 100%"
                />
              ) as any
            }
          >
            <Text
              size="2xs"
              color="neutral"
              weight="semibold"
              className="oui-cursor-pointer oui-border-b oui-border-dashed oui-border-b-white/10"
            >
              Risk rate
            </Text>
          </Tooltip>
          <Text
            size="xs"
            color="neutral"
            weight="semibold"
            className={cn(textColor)}
          >
            {riskRate}
          </Text>
        </Flex>

        <Flex direction="column" itemAlign="end" className="oui-flex-1">
          <Tooltip content={(<div>hint test</div>) as any}>
            <Text
              size="2xs"
              color="neutral"
              weight="semibold"
              className="oui-cursor-pointer"
            >
              Max account leverage
            </Text>
          </Tooltip>
          <Flex className="oui-gap-1">
            {isConnected ? (
              <Text.numeral suffix={"x"}>{currentLeverage}</Text.numeral>
            ) : (
              "--"
            )}

            <span className={"oui-text-base-contrast-54"}>/</span>

            {
              // modal.show(LeverageWidgetId, { currentLeverage: 5 });
              isConnected ? (
                <button
                  className="oui-flex oui-items-center oui-gap-1"
                  onClick={() => {
                    modal.show(LeverageWidgetId, { currentLeverage: 5 });
                  }}
                >
                  <span>{`${maxLeverage ?? "--"}x`}</span>
                  {typeof maxLeverage !== "undefined" && (
                    <EditIcon size={12} color="white"/>
                  )}
                </button>
              ) : (
                "--"
              )
            }
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};
