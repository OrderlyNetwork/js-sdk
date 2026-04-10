import { useMemo } from "react";
import { useAccount } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { useAppContext } from "@orderly.network/react-app";
import { AccountStatusEnum } from "@orderly.network/types";
import { Button, Flex, modal, Text } from "@orderly.network/ui";
import { AuthGuard } from "@orderly.network/ui-connector";
import { useReferralContext } from "../../../../provider";
import { ReferralCodeFormType } from "../../../../types";
import { ReferralCodeFormDialogId } from "../../affiliate/referralCodeForm/modal";
import { TradingVolumeProgress } from "../../components/tradingVolumeProgress";

/** SWR mutate may resolve to various shapes — only treat numeric max_rebate_rate as valid. */
function parseMaxRebateRateFromSettled(
  result: PromiseSettledResult<unknown>,
): number | undefined {
  if (result.status !== "fulfilled") return undefined;
  const num = (result.value as { max_rebate_rate?: unknown })?.max_rebate_rate;
  return typeof num === "number" ? num : undefined;
}

export const Hero = () => {
  const { t } = useTranslation();
  const { state } = useAccount();
  const { wrongNetwork } = useAppContext();
  const status = state.status;

  const {
    isMultiLevelReferralUnlocked,
    isMultiLevelEnabled,
    isTrader,
    multiLevelRebateInfo,
    multiLevelRebateInfoMutate,
    maxRebateRate,
    maxRebateRateMutate,
    mutate,
  } = useReferralContext();

  const showCreateReferralCodeModal = (maxRateOverride?: number) => {
    modal.show(ReferralCodeFormDialogId, {
      type: ReferralCodeFormType.Create,
      maxRebateRate: maxRateOverride ?? maxRebateRate ?? 0,
      directBonusRebateRate: 0,
      onSuccess: () => {
        multiLevelRebateInfoMutate();
      },
    });
  };

  const onCreateReferralCode = () => {
    // if not bound to any codes, show the bind modal
    if (!isTrader) {
      modal.show(ReferralCodeFormDialogId, {
        type: ReferralCodeFormType.Bind,
        maxRebateRate: maxRebateRate,
        onSuccess: async () => {
          const results = await Promise.allSettled([
            maxRebateRateMutate(),
            multiLevelRebateInfoMutate(),
            mutate(),
          ]);

          const latestMaxRebateRate =
            parseMaxRebateRateFromSettled(results[0]) ?? maxRebateRate;

          showCreateReferralCodeModal(latestMaxRebateRate);
        },
      });
      return;
    }

    showCreateReferralCodeModal();
  };

  const description = useMemo(() => {
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
      return "";
    }

    return t("affiliate.newReferralProgram.description");
  }, [t, wrongNetwork, status]);

  const renderContent = () => {
    if (!isMultiLevelReferralUnlocked) {
      return (
        <TradingVolumeProgress
          classNames={{
            root: "oui-items-start",
            description: "!oui-text-start",
          }}
          buttonProps={{
            size: "xl",
          }}
        />
      );
    }

    if (isMultiLevelEnabled && !multiLevelRebateInfo?.referral_code) {
      return (
        <Button size="lg" className="oui-px-4" onClick={onCreateReferralCode}>
          {t("affiliate.referralCode.create")}
        </Button>
      );
    }

    return "";

    // return (
    //   <Button size="lg" className="oui-px-4" disabled>
    //     {t("affiliate.accountNotEligible")}
    //   </Button>
    // );
  };

  return (
    <Flex
      gap={8}
      className="oui-affiliate-hero oui-flex-col-reverse md:oui-flex-row"
      id="oui-affiliate-landing-hero"
      itemAlign={"center"}
    >
      <Flex direction="column" itemAlign="start" gap={6} className="oui-flex-1">
        <Flex
          direction="column"
          gap={3}
          itemAlign="start"
          id="oui-affiliate-landing-hero-title"
        >
          <Text
            weight="semibold"
            className="oui-text-[32px] oui-leading-tight md:oui-text-[48px]"
          >
            {t("affiliate.landing.title")}
          </Text>
        </Flex>

        {description && (
          <Text size="sm" intensity={54}>
            {description}
          </Text>
        )}

        <AuthGuard
          labels={{
            connectWallet: t("affiliate.connectWallet"),
            signin: t("affiliate.setUpAccount"),
            enableTrading: t("affiliate.setUpAccount"),
          }}
        >
          {renderContent()}
        </AuthGuard>
      </Flex>

      <img
        src="https://oss.orderly.network/static/sdk/referral/network-diagram.png"
        alt="Network diagram"
        className="oui-size-[335px] oui-object-cover md:oui-size-[480px]"
        id="oui-affiliate-landing-network-diagram"
      />
    </Flex>
  );
};
