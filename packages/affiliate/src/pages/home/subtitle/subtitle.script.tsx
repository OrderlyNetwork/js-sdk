import { RefferalAPI } from "@kodiak-finance/orderly-hooks";
import { BuildNode, useReferralContext } from "../../../hooks";
import { ReactNode } from "react";

export type SubtitleReturns = {
  onLearnAffiliate?: () => void;
  learnAffiliateUrl?: string;
  
};

export const useSubtitleScript = (): SubtitleReturns => {
  const state =
    useReferralContext();

    const { onLearnAffiliate, learnAffiliateUrl,} = state;

  return {
    onLearnAffiliate,
    learnAffiliateUrl,
  };
};
