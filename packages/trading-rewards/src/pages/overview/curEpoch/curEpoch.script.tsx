import {
  CurrentEpochEstimate,
  EpochInfoType,
  useAccount,
  useCurEpochEstimate,
  useWalletConnector,
} from "@orderly.network/hooks";
import { useTradingRewardsContext } from "../provider";
import { useMemo } from "react";
import { AccountStatusEnum } from "@orderly.network/types";

export type CurEpochReturns = {
  epochList?: EpochInfoType;
  estimate?: CurrentEpochEstimate;
  notConnected: boolean;
  connect: () => Promise<any>
};
export const useCurEpochScript = () => {
  const { epochList, curEpochEstimate: estimate } = useTradingRewardsContext();
  const { connect } = useWalletConnector();
  const { state } = useAccount();

  const notConnected = useMemo(() => {
    return state.status < AccountStatusEnum.SignedIn;
  }, [
    state,
  ]);

  
  return { epochList, estimate, notConnected, connect };
};
