import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Button, cn, Divider, Flex, Text } from "@orderly.network/ui";
import { removeTrailingZeros } from "@orderly.network/utils";
import type { LTVTooltipScriptReturn } from "./LTVRiskTooltip.script";

const calculateLTVColor = (val: number): string => {
  if (val >= 0 && val < 50) {
    return "oui-text-success";
  } else if (val >= 50 && val < 80) {
    return "oui-text-warning";
  } else if (val >= 80) {
    return "oui-text-danger";
  } else {
    return "";
  }
};

export const LTVRiskTooltipUI: React.FC<LTVTooltipScriptReturn> = (props) => {
  const { t } = useTranslation();
  const {
    ltv_threshold,
    negative_usdc_threshold,
    isThresholdLoading,
    holdingList = [],
    currentLtv,
  } = props;
  return (
    <Flex gap={1} className="oui-w-72 oui-max-w-72" direction="column">
      <Flex width={"100%"} justify="between" itemAlign="center">
        <Text intensity={36} size="xs">
          {t("common.assets")}
        </Text>
        <Text intensity={36} size="xs">
          Collateral contribution
        </Text>
      </Flex>
      {holdingList.map((asset, index) => {
        return (
          <Flex
            key={`item-${index}`}
            width={"100%"}
            justify="between"
            itemAlign="center"
          >
            <Text intensity={80} size="xs">
              {asset.token}
            </Text>
            <Text
              size="xs"
              intensity={80}
              className={cn(Number(asset.holding) < 0 && "oui-text-warning")}
            >
              {removeTrailingZeros(asset.holding)}
            </Text>
          </Flex>
        );
      })}
      <Divider className="oui-w-full" />
      <Flex width={"100%"} justify="between" itemAlign="center">
        <Text intensity={36} size="xs">
          Current LTV
        </Text>
        <Text
          size="xs"
          intensity={36}
          className={cn("oui-select-none", calculateLTVColor(currentLtv))}
        >
          {currentLtv}%
        </Text>
      </Flex>
      <Text className="oui-py-2" intensity={54} size="xs">
        If your LTV exceeds {isThresholdLoading ? "-" : ltv_threshold}% or your
        USDC balance plus Unsettled PnL falls below{" "}
        {isThresholdLoading ? "-" : negative_usdc_threshold}, your collateral
        will be automatically converted with a haircut. To avoid this, you can
        manually convert assets to USDC.
      </Text>
      <Button fullWidth size={"md"} variant={"outlined"} color={"secondary"}>
        Convert assets to USDC
      </Button>
    </Flex>
  );
};
