import { modal } from "@orderly.network/ui";
import { ReferralCodeFormDialogId } from "../referralCodeForm/modal";

export const useMultiLevelReferralScript = () => {
  const isUnlock = false;

  const createReferralCode = () => {
    modal.show(ReferralCodeFormDialogId, {
      type: "edit",
    });
  };

  const tradeUnlock = () => {};

  const onClick = () => {
    if (isUnlock) {
      tradeUnlock();
    } else {
      createReferralCode();
    }
  };

  return {
    isUnlock,
    onClick,
    currentVolume: 80000,
    unlockVolume: 100000,
  };
};

export type MultiLevelReferralReturns = ReturnType<
  typeof useMultiLevelReferralScript
>;
