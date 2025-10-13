import React, { FC } from "react";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { useAppContext } from "@kodiak-finance/orderly-react-app";
import {
  Flex,
  Text,
  Box,
  Tooltip,
  modal,
  gradientTextVariants,
  cn,
  EditIcon,
} from "@kodiak-finance/orderly-ui";
import { LeverageWidgetWithDialogId } from "@kodiak-finance/orderly-ui-leverage";
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

      <Flex direction="row" justify="between">
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
    </Box>
  );
};
