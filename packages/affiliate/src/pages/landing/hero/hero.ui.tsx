import React, { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Button, Flex, Text } from "@orderly.network/ui";
import { ProgressSectionWidget } from "../progressSection";
import type { HeroState } from "./hero.script";
import { HeroTitle } from "./heroTitle";
import { NetworkDiagram } from "./networkDiagram";

export type HeroProps = HeroState & {
  className?: string;
  style?: React.CSSProperties;
};

export const Hero: FC<HeroProps> = (props) => {
  const {
    volumePrerequisite,
    isMultiLevelReferralUnlocked,
    isMultiLevelEnabled,
    multiLevelRebateInfo,
  } = props;

  const { t } = useTranslation();

  const renderTitle = () => {
    if (!isMultiLevelReferralUnlocked) {
      return "Trade 10,000 USDC volume to unlock the ability to invite friends and earn commissions.";
    }
    return "Give your sub-affiliates the power to customize their earnings, while you unlock an endless stream of passive income from every trader in your growing network.";
  };
  const renderConetent = () => {
    if (!isMultiLevelReferralUnlocked) {
      return (
        <ProgressSectionWidget
          currentVolume={volumePrerequisite?.current_volume}
          targetVolume={volumePrerequisite?.required_volume}
          onButtonClick={props.onTrade}
        />
      );
    }

    if (isMultiLevelEnabled && !multiLevelRebateInfo?.referral_code) {
      return (
        <Button
          size="lg"
          className="oui-px-4"
          onClick={props.onCreateReferralCode}
        >
          {t("affiliate.referralCodes.create")}
        </Button>
      );
    }

    return (
      <Button size="lg" className="oui-px-4" disabled>
        {t("affiliate.accountNotEligible")}
      </Button>
    );
  };

  return (
    <Flex
      gap={8}
      className="oui-flex-col-reverse md:oui-flex-row"
      id="oui-affiliate-landing-hero"
      itemAlign={"center"}
    >
      {/* Left side: Title and Progress */}
      <Flex direction="column" itemAlign="start" gap={6} className="oui-flex-1">
        <HeroTitle />
        <Text size="sm" intensity={54}>
          {renderTitle()}
        </Text>
        {renderConetent()}
      </Flex>

      {/* Right side: Network Diagram */}
      <Flex
        justify="center"
        itemAlign="center"
        className="oui-size-[335px] oui-p-6 md:oui-size-[480px]"
      >
        <NetworkDiagram />
      </Flex>
    </Flex>
  );
};
