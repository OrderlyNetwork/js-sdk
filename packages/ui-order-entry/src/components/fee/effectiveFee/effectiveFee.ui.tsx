import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { useAppContext } from "@orderly.network/react-app";
import { Flex, modal, Text, Tooltip, useScreen } from "@orderly.network/ui";
import { AuthGuard } from "@orderly.network/ui-connector";
import { useFeeScript } from "../fees.script";
import { EffectiveFee } from "./icons";

const EffectiveFeeSection: React.FC<{ content: string }> = (props) => {
  const { content } = props;
  const { isMobile } = useScreen();
  const { t } = useTranslation();
  if (isMobile) {
    return (
      <EffectiveFee
        onClick={() => {
          modal.dialog({ title: t("common.tips"), content: content });
        }}
      />
    );
  }
  return (
    <Tooltip content={content} className="oui-p-1.5 oui-text-base-contrast-54">
      <EffectiveFee className={"oui-cursor-pointer"} />
    </Tooltip>
  );
};

export const EffectiveFeeUI: React.FC<
  Pick<
    ReturnType<typeof useFeeScript>,
    "effectiveTakerFee" | "effectiveMakerFee"
  >
> = (props) => {
  const { t } = useTranslation();
  const { effectiveTakerFee, effectiveMakerFee } = props;

  const { widgetConfigs } = useAppContext();

  const originalTrailingFees = (
    <Flex itemAlign="center" justify="between" width={"100%"} gap={1}>
      <Flex width={"100%"} itemAlign="center" justify={"between"}>
        <Text className="oui-truncate" size="2xs">
          {t("common.effectiveFee")}
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
              {effectiveTakerFee}
            </Text>
            <Text size="2xs">/</Text>
            <Text className="oui-truncate" size="2xs">
              {t("portfolio.feeTier.column.maker")}:
            </Text>
            <Text size="2xs" className="oui-text-base-contrast-80">
              {effectiveMakerFee}
            </Text>
          </Flex>
        </AuthGuard>
      </Flex>
      <EffectiveFeeSection
        content={t("portfolio.feeTier.effectiveFee.tooltip")}
      />
    </Flex>
  );

  const customTrailingFees = widgetConfigs?.orderEntry?.fees?.trailing;

  return typeof customTrailingFees === "function"
    ? customTrailingFees(originalTrailingFees)
    : originalTrailingFees;
};
