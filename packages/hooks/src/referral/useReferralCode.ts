import { useMutation } from "../useMutation";

export const useReferralCode = () => {
  const [createReferralCode, { isMutating: isCreateMutating }] = useMutation(
    "/v1/referral/multi_level/claim_code",
  );

  const [editReferralCode, { isMutating: isEditMutating }] = useMutation(
    "/v1/referral/edit_referral_code",
  );

  const [updateRebateRate, { isMutating: isUpdateRebateRateMutating }] =
    useMutation("/v1/referral/multi_level/rebate_rate/update");

  const isMutating =
    isCreateMutating || isEditMutating || isUpdateRebateRateMutating;

  return {
    createReferralCode,
    editReferralCode,
    updateRebateRate,
    isMutating,
  };
};
