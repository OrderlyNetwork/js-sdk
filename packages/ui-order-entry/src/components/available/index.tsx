import { useMemo } from "react";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { Flex, Tooltip, Text, InfoCircleIcon } from "@kodiak-finance/orderly-ui";
import { LTVRiskTooltipWidget } from "../LTVRiskTooltip";

type AvailableProps = {
  canTrade: boolean;
  currentLtv: number;
  freeCollateral: number;
  quote?: string;
};

export const Available = (props: AvailableProps) => {
  const { canTrade, currentLtv, quote, freeCollateral } = props;
  const { t } = useTranslation();

  const showLTV = useMemo(() => {
    return (
      typeof currentLtv === "number" &&
      !Number.isNaN(currentLtv) &&
      currentLtv > 0
    );
  }, [currentLtv]);

  return (
    <Flex itemAlign={"center"} justify={"between"}>
      <Text size={"2xs"}>{t("common.available")}</Text>
      <Flex itemAlign={"center"} justify={"center"} gap={1}>
        {showLTV && (
          <Tooltip
            className={"oui-bg-base-6 oui-p-2"}
            content={<LTVRiskTooltipWidget />}
          >
            <InfoCircleIcon
              className={"oui-cursor-pointer oui-text-warning oui-opacity-80"}
            />
          </Tooltip>
        )}
        <Text.numeral
          unit={quote}
          size={"2xs"}
          className={"oui-text-base-contrast-80"}
          unitClassName={"oui-ml-1 oui-text-base-contrast-54"}
          dp={2}
          padding={false}
        >
          {canTrade ? freeCollateral : 0}
        </Text.numeral>
      </Flex>
    </Flex>
  );
};
