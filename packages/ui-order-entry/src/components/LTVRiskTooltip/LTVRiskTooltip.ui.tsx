import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Button, cn, Divider, Flex, Text } from "@orderly.network/ui";
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

const testData = [
  { symbol: "USDC", amount: "-4000.00" },
  { symbol: "ETH", amount: "14000.00" },
];

const currentLtv = 64; // Test data

export const LTVRiskTooltipUI: React.FC<LTVTooltipScriptReturn> = (props) => {
  const { t } = useTranslation();
  const { ltv_threshold, negative_usdc_threshold, isThresholdLoading } = props;
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
      {testData.map((asset, index) => {
        return (
          <Flex
            key={`item-${index}`}
            width={"100%"}
            justify="between"
            itemAlign="center"
          >
            <Text intensity={80} size="xs">
              {asset.symbol}
            </Text>
            <Text
              size="xs"
              intensity={80}
              className={cn(Number(asset.amount) < 0 && "oui-text-warning")}
            >
              {asset.amount}
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
        If your LTV exceeds 95%, your collateral will be automatically converted
        to USDC to repay the borrowed amount, incurring a 5% fee. To avoid
        automatic conversion, you may choose to convert assets to USDC manually.
      </Text>
      <Button fullWidth size={"md"} variant={"outlined"} color={"secondary"}>
        Convert assets to USDC
      </Button>
    </Flex>
  );
};
