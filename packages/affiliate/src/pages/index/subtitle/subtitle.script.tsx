import { RefferalAPI } from "@orderly.network/hooks";
import { BuildNode, useReferralContext } from "../../../hooks";
import { ReactNode } from "react";

export type SubtitleReturns = {
  onLearnAffiliate?: () => void;
  learnAffiliateUrl?: string;
  overwrite?: () => ReactNode;
  referralInfo?: RefferalAPI.ReferralInfo;
};

export const useSubtitleScript = (): SubtitleReturns => {
  const state =
    useReferralContext();

    const { onLearnAffiliate, learnAffiliateUrl, overwrite: ov, referralInfo } = state;

    const isOverwrite = ov?.ref?.top !== undefined;

    const overwrite = () => {
        return ov?.ref?.top?.(state);
    }

  return {
    onLearnAffiliate,
    learnAffiliateUrl,
    overwrite: isOverwrite ? overwrite : undefined,
    referralInfo,
  };
};
