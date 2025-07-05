import React from "react";
// import { useTranslation } from "@orderly.network/i18n";
import { Flex, Text } from "@orderly.network/ui";

// import type { CollateralContributionReturns } from "./collateralContribution.script";

export const CollateralContributionUI: React.FC<
  Readonly<{ collateralContribution: number; token: string }>
> = (props) => {
  // const { t } = useTranslation();
  const { collateralContribution, token } = props;
  return (
    <Flex width="100%" itemAlign="center" justify="between">
      <Flex itemAlign="center" justify="start">
        <Text size="2xs" intensity={36}>
          Collateral contribution
        </Text>
      </Flex>
      <Flex itemAlign="center" justify="end" gap={1}>
        <Text size="2xs" intensity={80} className="oui-select-none">
          {collateralContribution}
        </Text>
        <Text size="2xs" intensity={36} className="oui-select-none">
          {token}
        </Text>
      </Flex>
    </Flex>
  );
};
