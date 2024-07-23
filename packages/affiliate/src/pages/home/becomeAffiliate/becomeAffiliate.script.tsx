import {
    BuildNode,
    ReferralContextReturns,
    useReferralContext,
  } from "../../../hooks";

export type BecomeAffiliateReturns = {
    state: ReferralContextReturns;
    overwrite?: BuildNode;
};

export const useBecomeAffiliateScript = (): BecomeAffiliateReturns => {
    const state = useReferralContext();

    return {
      overwrite: state.overwrite?.ref?.step,
      state,
    };
};
