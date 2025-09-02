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

  const originalTrailingFees = (
    <Flex itemAlign="center" justify="between" width={"100%"} gap={1}>
      <Flex width={"100%"} itemAlign="center" justify={"between"}>
        <Text className="oui-truncate" size="2xs">
          {t("common.fees")}
        </Text>
        <AuthGuard
          fallback={() => (
            <Text className="oui-truncate" size="2xs">
              {t("portfolio.feeTier.column.taker")}: --% /{" "}
              {t("portfolio.feeTier.column.maker")}: --%
            </Text>
          )}
        >
          <Flex gap={1}>
            <Text className="oui-truncate" size="2xs">
              {t("portfolio.feeTier.column.taker")}:
            </Text>
            <Text size="2xs" className="oui-text-base-contrast-80">
              {takerFeeRate}
            </Text>
            <Text size="2xs">/</Text>
            <Text className="oui-truncate" size="2xs">
              {t("portfolio.feeTier.column.maker")}:
            </Text>
            <Text size="2xs" className="oui-text-base-contrast-80">
              {makerFeeRate}
            </Text>
          </Flex>
        </AuthGuard>
      </Flex>
    </Flex>
  );

  const customTrailingFees = widgetConfigs?.orderEntry?.fees?.trailing;

  return typeof customTrailingFees === "function"
    ? customTrailingFees(originalTrailingFees)
    : originalTrailingFees;
};
