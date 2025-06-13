import React, { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { useAppContext } from "@orderly.network/react-app";
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
import { LeverageWidgetWithDialogId } from "@orderly.network/ui-leverage";
import { TooltipContent } from "../assetView/assetView.ui";
import { RiskRateState } from "./riskRate.script";

export const RiskRate: FC<RiskRateState> = (props) => {
  const { riskRate, riskRateColor, currentLeverage, maxLeverage } = props;
  const { isHigh, isMedium, isLow } = riskRateColor;
  const { wrongNetwork } = useAppContext();
  const { t } = useTranslation();

  const textColor = wrongNetwork
    ? ""
    : isHigh
      ? "oui-text-danger"
      : isMedium
        ? "oui-text-warning-darken"
        : isLow
          ? gradientTextVariants({ color: "brand" })
          : "";

  const boxClsName = wrongNetwork
    ? "oui-bg-gradient-to-r oui-opacity-20 oui-from-[#26fefe]  oui-via-[#ff7d00] oui-to-[#d92d6b] oui-h-1.5 oui-rounded-full"
    : isHigh
      ? "oui-bg-gradient-to-tr oui-from-[#791438] oui-to-[#ff447c] oui-h-1.5 oui-rounded-full"
      : isMedium
        ? "oui-bg-gradient-to-tr oui-from-[#792e00] oui-to-[#ffb65d] oui-h-1.5 oui-rounded-full"
        : isLow
          ? "oui-bg-gradient-to-tr oui-from-[#59b0fe] oui-to-[#26fefe] oui-h-1.5 oui-rounded-full"
          : "oui-bg-gradient-to-r oui-opacity-20 oui-from-[#26fefe]  oui-via-[#ff7d00] oui-to-[#d92d6b] oui-h-1.5 oui-rounded-full";

  return (
    <Box data-risk={""} className="oui-space-y-2">
      <Flex
        itemAlign="center"
        justify="start"
        className="oui-w-full oui-bg-base-6 oui-rounded-full oui-h-2 oui-px-[1px]"
      >
        <Box
          className={boxClsName}
          style={
            riskRate && riskRate !== "--"
              ? { width: riskRate }
              : { width: "100%" }
          }
        />
      </Flex>

      <Flex className="oui-gap-2" justify="between">
        <Flex direction="column">
          <Tooltip
            content={
              <TooltipContent
                description={t("trading.riskRate.tooltip")}
                formula={t("trading.riskRate.formula")}
              />
            }
          >
            <Text
              size="2xs"
              color="neutral"
              weight="semibold"
              className={cn(
                "oui-cursor-pointer",
                "oui-border-b oui-border-dashed oui-border-b-white/10",
              )}
            >
              {t("trading.riskRate")}
            </Text>
          </Tooltip>
          <Text
            size="xs"
            color="neutral"
            weight="semibold"
            className={cn(textColor)}
          >
            {riskRate ?? "--"}
          </Text>
        </Flex>

        <Flex direction="column">
          <Text
            size="2xs"
            color="neutral"
            weight="semibold"
            className={cn(
              "oui-cursor-pointer",
              // add extra bottom border to make height same as risk rate text
              "oui-border-b oui-border-b-transparent",
            )}
          >
            {t("leverage.maxAccountLeverage")}
          </Text>
          <Flex className="oui-gap-1">
            <Text.numeral
              dp={2}
              padding={false}
              suffix={currentLeverage ? "x" : undefined}
            >
              {currentLeverage ?? "--"}
            </Text.numeral>

            <span className={"oui-text-base-contrast-54"}>/</span>

            <button
              className="oui-flex oui-items-center oui-gap-1"
              onClick={() => {
                modal.show(LeverageWidgetWithDialogId, { currentLeverage: 5 });
              }}
              data-testid="oui-testid-riskRate-leverage-button"
            >
              <Text.numeral
                dp={2}
                padding={false}
                suffix={maxLeverage ? "x" : undefined}
                data-testid="oui-testid-riskRate-leverage-value"
              >
                {maxLeverage ?? "--"}
              </Text.numeral>

              {typeof maxLeverage !== "undefined" && maxLeverage !== null && (
                <EditIcon size={12} color="white" />
              )}
            </button>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};
