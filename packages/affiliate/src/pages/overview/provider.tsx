import { PropsWithChildren, createContext, useContext } from "react";
import {
  TWType,
  EpochInfoType,
  useEpochInfo,
  useAllBrokers,
  useGetClaimed,
  DistributionId,
  useCurEpochEstimate,
  CurrentEpochEstimate,
  useWalletRewardsHistory,
  WalletRewards,
} from "@orderly.network/hooks";

export type TradingRewardsState = {
  
};

export const TradingRewardsContext = createContext<TradingRewardsState>({
  
});

export const TradingRewardsProvider = (
  props: PropsWithChildren
) => {
  

  return (
    <TradingRewardsContext.Provider
      value={{
       
      }}
    >
      {/* <PageLoading loading={epochList.data === undefined}> */}
      {props.children}
      {/* </PageLoading> */}
    </TradingRewardsContext.Provider>
  );
};

export function useTradingRewardsContext() {
  return useContext(TradingRewardsContext);
}
