import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { useAppContext } from "@orderly.network/react-app";
import { Flex, Text } from "@orderly.network/ui";
import { AuthGuard } from "@orderly.network/ui-connector";
import { useFeesScript } from "./fees.script";

export const FeesUI: React.FC<ReturnType<typeof useFeesScript>> = (props) => {
  const { t } = useTranslation();
  const { takerFeeRate, makerFeeRate } = props;

  const { widgetConfigs } = useAppContext();

  const originalTrailing = (
    <Flex width={"100%"} itemAlign="center" justify={"between"}>
      <Text size="2xs">{t("common.fees")}</Text>
      <AuthGuard
        fallback={() => (
          <Text size="2xs">
            {t("portfolio.feeTier.column.taker")}: --% /{" "}
            {t("portfolio.feeTier.column.maker")}: --%
          </Text>
        )}
      >
        <Flex gap={1}>
          <Text size="2xs">{t("portfolio.feeTier.column.taker")}:</Text>
          <Text size="2xs" className="oui-text-base-contrast-80">
            {takerFeeRate}
          </Text>
          <Text size="2xs">/</Text>
          <Text size="2xs">{t("portfolio.feeTier.column.maker")}:</Text>
          <Text size="2xs" className="oui-text-base-contrast-80">
            {makerFeeRate}
          </Text>
        </Flex>
      </AuthGuard>
    </Flex>
  );

  const customTrailing = widgetConfigs?.orderEntry?.fees?.trailing;

  return typeof customTrailing === "function"
    ? customTrailing(originalTrailing)
    : originalTrailing;
};
