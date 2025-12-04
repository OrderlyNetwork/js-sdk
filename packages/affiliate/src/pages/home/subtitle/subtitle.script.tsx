import { ReactNode } from "react";
import { RefferalAPI } from "@veltodefi/hooks";
import { BuildNode, useReferralContext } from "../../../provider";

export type SubtitleReturns = {
  onLearnAffiliate?: () => void;
  learnAffiliateUrl?: string;
};

export const useSubtitleScript = (): SubtitleReturns => {
  const state = useReferralContext();

  const { onLearnAffiliate, learnAffiliateUrl } = state;

  return {
    onLearnAffiliate,
    learnAffiliateUrl,
  };
};
