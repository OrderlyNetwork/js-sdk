import {
  BuildNode,
  ReferralContextReturns,
  useReferralContext,
} from "../../../hooks";

export type CardReturns = {
  state: ReferralContextReturns;
  overwrite?: BuildNode;
};

export const useCardScript = (): CardReturns => {
  const state = useReferralContext();

  return {
    overwrite: state.overwrite?.ref?.card,
    state,
  };
};
