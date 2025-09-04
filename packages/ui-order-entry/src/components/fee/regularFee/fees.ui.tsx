import React from "react";
import { useFeeState } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { useAppContext } from "@orderly.network/react-app";
import { Flex, Text } from "@orderly.network/ui";
import { AuthGuard } from "@orderly.network/ui-connector";

export const RegularFeesUI: React.FC<
  Pick<ReturnType<typeof useFeeState>, "takerFee" | "makerFee">
> = (props) => {
  const { t } = useTranslation();
  const { takerFee, makerFee } = props;

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
              {takerFee}
            </Text>
            <Text size="2xs">/</Text>
            <Text className="oui-truncate" size="2xs">
              {t("portfolio.feeTier.column.maker")}:
            </Text>
            <Text size="2xs" className="oui-text-base-contrast-80">
              {makerFee}
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
