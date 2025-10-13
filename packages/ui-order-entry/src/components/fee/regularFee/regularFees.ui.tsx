import React from "react";
import { useFeeState } from "@kodiak-finance/orderly-hooks";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { Flex, Text } from "@kodiak-finance/orderly-ui";
import { AuthGuard } from "@kodiak-finance/orderly-ui-connector";

export const RegularFeesUI: React.FC<
  Pick<ReturnType<typeof useFeeState>, "takerFee" | "makerFee">
> = (props) => {
  const { t } = useTranslation();
  const { takerFee, makerFee } = props;

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

  return originalTrailingFees;
};
