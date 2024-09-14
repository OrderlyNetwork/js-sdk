import React, { FC } from "react";
import { Flex, Text, Box, Tooltip, modal } from "@orderly.network/ui";
import { RiskRateState } from "./riskRate.script";
import { Pencil } from "lucide-react";
import { LeverageWidgetId } from "@orderly.network/ui-leverage";

export const RiskRate: FC<RiskRateState> = (props) => {
  const { riskRate, riskRateColor,isConnected,currentLeverage,maxLeverage } = props;
  const { isRed, isOrange, isBlue, isDefault } = riskRateColor;
  // TODO: 实际情况中应尽量避免直接写死颜色的值，考虑使用其他方式实现该功能
  const textColor = isRed
    ? "#d82d6a"
    : isOrange
    ? "#ff7d00"
    : isBlue
    ? "#59b0fe"
    : "";

  return (
    <Box data-risk={''} className="oui-space-y-2">
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

        {isRed ? (
          <Box
            className="oui-bg-gradient-to-tr oui-from-[#791438] oui-to-[#ff447c] oui-h-1.5 oui-rounded-full"
            style={{ width: riskRate }}
          />
        ) : null}

        {isOrange ? (
          <Box
            className="oui-bg-gradient-to-tr oui-from-[#792e00] oui-to-[#ffb65d] oui-h-1.5 oui-rounded-full"
            style={{ width: riskRate }}
          />
        ) : null}

        {isBlue ? (
          <Box
            className="oui-bg-gradient-to-tr oui-from-[#59b0fe] oui-to-[#26fefe] oui-h-1.5 oui-rounded-full"
            style={{ width: riskRate }}
          />
        ) : null}
      </Flex>

      <Flex className="oui-gap-2">
        <Flex direction="column" itemAlign="start" className="oui-flex-1">
          <Tooltip content={(<div>hint test</div>) as any}>
            <Text
              size="2xs"
              color="neutral"
              weight="semibold"
              className="oui-cursor-pointer"
            >
              Risk Rate
            </Text>
          </Tooltip>
          <Text
            size="xs"
            color="neutral"
            weight="semibold"
            style={{ color: textColor }}
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
              // TODO: 应该是 双横杆
              "-"
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
                  {/* TODO: 应该是 双横杆 */}
                  <span>{`${maxLeverage ?? "-"}x`}</span>
                  {typeof maxLeverage !== "undefined" && (
                    // @ts-ignore
                    <Pencil size={14} className="oui-text-base-contrast-54" />
                  )}
                </button>
              ) : (
                // TODO: 应该是 双横杆
                "-"
              )
            }
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};
