import { modal } from "@orderly.network/ui";
import { useReferralContext } from "../../../../provider";
import { ReferralCodeFormType } from "../../../../types";
import { ReferralCodeFormDialogId } from "../referralCodeForm/modal";

export const useMultiLevelReferralScript = () => {
  const {
    isMultiLevelReferralUnlocked,
    maxRebateRate,
    multiLevelRebateInfoMutate,
  } = useReferralContext();

  const createReferralCode = () => {
    modal.show(ReferralCodeFormDialogId, {
      type: ReferralCodeFormType.Create,
      maxRebateRate,
      directBonusRebateRate: 10, // Hardcoded value before API is ready
      onSuccess: () => {
        multiLevelRebateInfoMutate();
      },
    });
  };

  return {
    isMultiLevelReferralUnlocked,
    createReferralCode,
  };
};

export type MultiLevelReferralReturns = ReturnType<
  typeof useMultiLevelReferralScript
>;
