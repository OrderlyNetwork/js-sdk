import React from "react";
import { useFeeState } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { Flex, Text } from "@orderly.network/ui";
import { AuthGuard } from "@orderly.network/ui-connector";

export const RegularFeesUI: React.FC<{ taker: string; maker: string }> = (
  props,
) => {
  const { t } = useTranslation();
  const { taker, maker } = props;

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
              {taker}
            </Text>
            <Text size="2xs">/</Text>
            <Text className="oui-truncate" size="2xs">
              {t("portfolio.feeTier.column.maker")}:
            </Text>
            <Text size="2xs" className="oui-text-base-contrast-80">
              {maker}
            </Text>
          </Flex>
        </AuthGuard>
      </Flex>
    </Flex>
  );

  return originalTrailingFees;
};
