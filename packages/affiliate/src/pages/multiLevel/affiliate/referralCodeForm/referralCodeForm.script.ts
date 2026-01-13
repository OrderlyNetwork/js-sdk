export const useReferralCodeFormScript = () => {
  const onCreate = () => {};

  const onEdit = () => {};

  const onReview = () => {};

  return {
    referralCode: "",
    onCreate,
    onEdit,
    onReview,
  };
};

export type ReferralCodeFormReturns = ReturnType<
  typeof useReferralCodeFormScript
>;
