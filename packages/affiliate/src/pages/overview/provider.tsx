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

export type AffiliateState = {
  
};

export const AffiliateContext = createContext<AffiliateState>({
  
});

export const AffiliateProvider = (
  props: PropsWithChildren
) => {
  

  return (
    <AffiliateContext.Provider
      value={{
       
      }}
    >
      {/* <PageLoading loading={epochList.data === undefined}> */}
      {props.children}
      {/* </PageLoading> */}
    </AffiliateContext.Provider>
  );
};

export function useTradingRewardsContext() {
  return useContext(AffiliateContext);
}
