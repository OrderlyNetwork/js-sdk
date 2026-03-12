import { useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { MarginMode } from "@orderly.network/types";
import {
  Flex,
  Tooltip,
  Text,
  InfoCircleIcon,
  AddCircleIcon,
  Button,
  modal,
  useScreen,
} from "@orderly.network/ui";
import { LTVRiskTooltipWidget } from "../LTVRiskTooltip";

type AvailableProps = {
  canTrade: boolean;
  currentLtv: number;
  freeCollateral: number;
  quote?: string;
  marginMode?: MarginMode;
};

export const Available = (props: AvailableProps) => {
  const { canTrade, currentLtv, quote, freeCollateral, marginMode } = props;
  const { t } = useTranslation();
  const { isMobile } = useScreen();

  const showLTV = useMemo(() => {
    return (
      typeof currentLtv === "number" &&
      !Number.isNaN(currentLtv) &&
      currentLtv > 0
    );
  }, [currentLtv]);

  return (
    <Flex
      itemAlign={"center"}
      justify={"between"}
      className="oui-orderEntry-available"
    >
      <Text className="oui-available-label" size={"2xs"}>
        {t("common.available")}
      </Text>
      <Flex itemAlign={"center"} justify={"center"} gap={1}>
        {showLTV && (
          <Tooltip
            className={"oui-available-ltvRisk-tooltip oui-bg-base-6 oui-p-2"}
            content={<LTVRiskTooltipWidget marginMode={marginMode} />}
          >
            <InfoCircleIcon
              className={"oui-cursor-pointer oui-text-warning oui-opacity-80"}
            />
          </Tooltip>
        )}
        <Text.numeral
          unit={quote}
          size={"2xs"}
          className={"oui-available-value oui-text-base-contrast-80"}
          unitClassName={"oui-ml-1 oui-text-base-contrast-54"}
          dp={2}
          padding={false}
        >
          {canTrade ? freeCollateral : 0}
        </Text.numeral>
        <Button
          variant="text"
          size="xs"
          color="secondary"
          className="oui-available-deposit-icon oui-p-0 hover:oui-text-base-contrast-80"
          onClick={() => {
            // TODO: when we plan to move modal IDs to a public package, we need to use the ID from the public package
            const handleDomId = isMobile
              ? "DepositAndWithdrawWithSheetId"
              : "DepositAndWithdrawWithDialogId";
            modal.show(handleDomId, {
              activeTab: "deposit",
            });
          }}
        >
          <AddCircleIcon opacity={1} />
        </Button>
      </Flex>
    </Flex>
  );
};
