import { useMemo } from "react";
import { modal } from "@orderly.network/ui";
import { useScaffoldContext } from "@orderly.network/ui-scaffold";
import { useReferralContext } from "../../../../provider";
import { ReferralCodeFormType } from "../../../../types";
import { ReferralCodeFormDialogId } from "../referralCodeForm/modal";

export const useMultiLevelReferralScript = () => {
  const {
    isMultiLevelReferralUnlocked,
    maxRebateRate,
    volumePrerequisite,
    multiLevelRebateInfoMutate,
  } = useReferralContext();

  const { routerAdapter } = useScaffoldContext();

  const createReferralCode = () => {
    modal.show(ReferralCodeFormDialogId, {
      type: ReferralCodeFormType.Create,
      maxRebateRate,
      onSuccess: () => {
        multiLevelRebateInfoMutate();
      },
    });
  };

  const gotoTrade = () => {
    routerAdapter?.onRouteChange?.({
      href: "/perp",
      name: "Perp",
    });
  };

  const onClick = () => {
    if (isMultiLevelReferralUnlocked) {
      createReferralCode();
    } else {
      gotoTrade();
    }
  };

  const progressPercentage = useMemo(() => {
    return Math.round(
      Math.min(
        100,
        ((volumePrerequisite?.current_volume || 0) /
          (volumePrerequisite?.required_volume || 1)) *
          100,
      ),
    );
  }, [volumePrerequisite]);

  return {
    isMultiLevelReferralUnlocked,
    volumePrerequisite,
    progressPercentage,
    onClick,
  };
};

export type MultiLevelReferralReturns = ReturnType<
  typeof useMultiLevelReferralScript
>;
