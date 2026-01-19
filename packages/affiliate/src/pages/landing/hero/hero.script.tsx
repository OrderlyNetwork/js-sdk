import { useAppContext } from "@orderly.network/react-app";
import { modal } from "@orderly.network/ui";
import { useReferralContext } from "../../../provider";
import { ReferralCodeFormDialogId } from "../../multiLevel/affiliate/referralCodeForm/modal";

export interface UseHeroScriptOptions {}

export const useHeroScript = (options?: UseHeroScriptOptions) => {
  const {
    isMultiLevelReferralUnlocked,
    volumePrerequisite,
    isMultiLevelEnabled,
    multiLevelRebateInfo,
    multiLevelRebateInfoMutate,
    max_rebate_rate,
  } = useReferralContext();

  const { onRouteChange } = useAppContext();

  const onTrade = () => {
    onRouteChange?.({
      href: "/perp",
      name: "Perp",
    });
  };

  const onCreateReferralCode = () => {
    modal.show(ReferralCodeFormDialogId, {
      type: "create",
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
  };
};

export type HeroState = ReturnType<typeof useHeroScript>;
