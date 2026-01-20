import { useAccount } from "@orderly.network/hooks";
import { useAppContext } from "@orderly.network/react-app";
import { modal } from "@orderly.network/ui";
import { useReferralContext } from "../../../provider";
import { ReferralCodeFormType } from "../../../types";
import { ReferralCodeFormDialogId } from "../../multiLevel/affiliate/referralCodeForm/modal";

export const useHeroScript = () => {
  const {
    isMultiLevelReferralUnlocked,
    volumePrerequisite,
    isMultiLevelEnabled,
    multiLevelRebateInfo,
    multiLevelRebateInfoMutate,
    max_rebate_rate,
  } = useReferralContext();

  const { state } = useAccount();

  const { onRouteChange, wrongNetwork, disabledConnect } = useAppContext();

  const onTrade = () => {
    // TODO：keep url query params
    onRouteChange?.({
      href: "/perp",
      name: "Perp",
    });
  };

  const onCreateReferralCode = () => {
    modal.show(ReferralCodeFormDialogId, {
      type: ReferralCodeFormType.Create,
      maxRebateRate: max_rebate_rate,
      onSuccess: () => {
        multiLevelRebateInfoMutate();
      },
    });
  };

  return {
    isMultiLevelReferralUnlocked,
    volumePrerequisite,
    isMultiLevelEnabled,
    multiLevelRebateInfo,
    onTrade,
    onCreateReferralCode,
    wrongNetwork,
    disabledConnect,
    status: state.status,
  };
};

export type HeroState = ReturnType<typeof useHeroScript>;
