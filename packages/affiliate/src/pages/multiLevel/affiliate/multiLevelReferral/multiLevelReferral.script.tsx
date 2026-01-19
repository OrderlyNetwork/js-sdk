import { useMemo } from "react";
import { modal } from "@orderly.network/ui";
import { useReferralContext } from "../../../../provider";
import { ReferralCodeFormDialogId } from "../referralCodeForm/modal";

export const useMultiLevelReferralScript = () => {
  const {
    isMultiLevelReferralUnlocked,
    max_rebate_rate,
    volumePrerequisite,
    multiLevelRebateInfoMutate,
  } = useReferralContext();

  const createReferralCode = () => {
    modal.show(ReferralCodeFormDialogId, {
      type: "create",
      maxRebateRate: max_rebate_rate,
      onSuccess: () => {
        multiLevelRebateInfoMutate();
      },
    });
  };

  // TODO: Implement trade unlock
  const tradeUnlock = () => {};

  const onClick = () => {
    if (isMultiLevelReferralUnlocked) {
      createReferralCode();
    } else {
      tradeUnlock();
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
