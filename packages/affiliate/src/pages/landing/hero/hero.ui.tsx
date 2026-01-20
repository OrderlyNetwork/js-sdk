import React, { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { AccountStatusEnum } from "@orderly.network/types";
import { Button, Flex, Text } from "@orderly.network/ui";
import { AuthGuard } from "@orderly.network/ui-connector";
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
    wrongNetwork,
    status,
  } = props;

  const { t } = useTranslation();

  const renderDescription = () => {
    if (wrongNetwork) {
      return t("affiliate.wrongNetwork.description");
    }

    if (status === AccountStatusEnum.NotConnected) {
      return t("affiliate.newReferralProgram.description");
    }

    if (
      status > AccountStatusEnum.Connected &&
      status < AccountStatusEnum.EnableTrading
    ) {
      return t("affiliate.setUpAccount.description");
    }

    if (!isMultiLevelReferralUnlocked) {
      return t("affiliate.newReferralProgram.tradeUnlock", {
        // TODO： add , split
        volume: volumePrerequisite?.required_volume,
      });
    }

    return t("affiliate.newReferralProgram.description");
  };

  const renderButton = () => {
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
          {renderDescription()}
        </Text>
        <AuthGuard
          labels={{
            connectWallet: t("affiliate.connectWallet"),
            signin: t("affiliate.setUpAccount"),
            enableTrading: t("affiliate.setUpAccount"),
          }}
        >
          {renderButton()}
        </AuthGuard>
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
