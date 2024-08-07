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
import { useDataTap } from "@orderly.network/react-app";

export type CurEpochReturns = {
  epochList?: EpochInfoType;
  estimate?: CurrentEpochEstimate;
  notConnected: boolean;
  connect: () => Promise<any>;
};
export const useCurEpochScript = () => {
  const { epochList, curEpochEstimate: estimate } = useTradingRewardsContext();
  const { connect } = useWalletConnector();
  const { state } = useAccount();

  const notConnected = useMemo(() => {
    return state.status < AccountStatusEnum.SignedIn;
  }, [state]);

  console.log("epochInfo 1", epochList[1]);
  
  const epochInfo = useDataTap(epochList[1].curEpochInfo);
  epochList[1].curEpochInfo = epochInfo ?? undefined;
  console.log("epochInfo 2", epochList[1]);


  return { epochList, estimate, notConnected, connect };
};
