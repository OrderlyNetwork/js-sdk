import {
  CurrentEpochEstimate,
  EpochInfoType,
  useCurEpochEstimate,
} from "@orderly.network/hooks";
import { useTradingRewardsContext } from "../provider";

export type CurEpochReturns = {
  epochList?: EpochInfoType;
  estimate?: CurrentEpochEstimate;
};
export const useCurEpochScript = () => {
  const { epochList, type } = useTradingRewardsContext();

  const { data: estimate } = useCurEpochEstimate(type);
  return { epochList, estimate };
};
