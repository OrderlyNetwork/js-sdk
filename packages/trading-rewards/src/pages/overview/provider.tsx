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
  type: TWType;
  epochList: EpochInfoType;
  totalOrderClaimedReward: { data: number | undefined; refresh: () => void };
  totalEsOrderClaimedReward: { data: number | undefined; refresh: () => void };
  curEpochEstimate?: CurrentEpochEstimate;
  walletRewardsHistory: {
    data: WalletRewards | undefined;
    refresh: () => void;
    error?: any;
  };
};

export const TradingRewardsContext = createContext<TradingRewardsState>({
  type: TWType.normal,
  totalOrderClaimedReward: { data: undefined, refresh: () => {} },
  totalEsOrderClaimedReward: { data: undefined, refresh: () => {} },
  epochList: {
    data: undefined,
    curEpochInfo: undefined,
    isUnstart: false,
    refresh: () => {},
  },
  walletRewardsHistory: {
    data: undefined,
    refresh: () => {}
  }
});

export const TradingRewardsProvider = (
  props: PropsWithChildren<{
    /// default is TWType.normal
    type?: TWType;
  }>
) => {
  // const searchParams = useSearchParams();
  // let type = parseToTWType(searchParams.get("type"));

  const { type = TWType.normal } = props;
  const totalOrderClaimedReward = useGetClaimed(
    type === TWType.mm ? DistributionId.mmOrder : DistributionId.order
  );
  const totalEsOrderClaimedReward = useGetClaimed(
    type === TWType.mm ? DistributionId.mmEsOrder : DistributionId.esORder
  );

  const brokers = useAllBrokers();

  const { data: curEpochEstimate } = useCurEpochEstimate(type);

  const walletRewardsHistory = useWalletRewardsHistory(type);

  
  const epochList = useEpochInfo(type as TWType);
  console.log("epochList", epochList);
  return (
    <TradingRewardsContext.Provider
      value={{
        type: type as TWType,
        totalOrderClaimedReward,
        totalEsOrderClaimedReward,
        // totalOrderClaimedReward: 2000,
        // totalEsOrderClaimedReward: 0,
        epochList,
        curEpochEstimate,
        walletRewardsHistory,
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
