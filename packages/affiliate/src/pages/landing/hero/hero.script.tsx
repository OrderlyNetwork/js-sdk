import { useAccount } from "@orderly.network/hooks";
import { useAppContext } from "@orderly.network/react-app";
import { modal } from "@orderly.network/ui";
import { useScaffoldContext } from "@orderly.network/ui-scaffold";
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
    maxRebateRate,
  } = useReferralContext();

  const { state } = useAccount();

  const { wrongNetwork, disabledConnect } = useAppContext();

  const { routerAdapter } = useScaffoldContext();

  const gotoTrade = () => {
    routerAdapter?.onRouteChange?.({
      href: "/perp",
      name: "Perp",
    });
  };

  const onCreateReferralCode = () => {
    modal.show(ReferralCodeFormDialogId, {
      type: ReferralCodeFormType.Create,
      maxRebateRate,
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
    gotoTrade,
    onCreateReferralCode,
    wrongNetwork,
    disabledConnect,
    status: state.status,
  };
};

export type HeroState = ReturnType<typeof useHeroScript>;
