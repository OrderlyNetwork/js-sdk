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
import { useAppContext, useDataTap } from "@orderly.network/react-app";

export type CurEpochReturns = {
  epochList?: EpochInfoType;
  estimate?: CurrentEpochEstimate;
  hideData: boolean;
  notConnected: boolean;
  connect: () => Promise<any>;
};
export const useCurEpochScript = () => {
  const { epochList, curEpochEstimate: estimate } = useTradingRewardsContext();
  const { wrongNetwork } = useAppContext();
  const { connect } = useWalletConnector();
  const { state } = useAccount();

  const hideData = useMemo(() => {
    return state.status <= AccountStatusEnum.SignedIn || wrongNetwork;
  }, [state , wrongNetwork]);

  const notConnected = useMemo(() => {
    return state.status <= AccountStatusEnum.SignedIn;
  }, [state]);

  
  console.log("xxxxx state,", state, notConnected);
  
  // const epochInfo = useDataTap(epochList[1].curEpochInfo);
  // epochList[1].curEpochInfo = epochInfo ?? undefined;


  return { epochList, estimate, hideData, notConnected, connect };
};
