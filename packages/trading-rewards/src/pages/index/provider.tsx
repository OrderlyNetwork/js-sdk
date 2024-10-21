import { PropsWithChildren, createContext, useContext, useMemo } from "react";
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
  WalletRewardsHistoryReturns,
  Brokers,
  useConfig,
} from "@orderly.network/hooks";
import { TitleConfig } from "./title/title.script";

export type TradingRewardsState = {
  type: TWType;
  brokerId: string;
  brokerName?: string;
  brokers?: Brokers;
  epochList: EpochInfoType;
  totalOrderClaimedReward: [number | undefined, { refresh: () => void }];
  totalEsOrderClaimedReward: [number | undefined, { refresh: () => void }];
  curEpochEstimate?: CurrentEpochEstimate;
  walletRewardsHistory: WalletRewardsHistoryReturns;
  titleConfig: TitleConfig;
};

export const TradingRewardsContext = createContext<TradingRewardsState>(
  {} as TradingRewardsState
);

export const TradingRewardsProvider = (
  props: PropsWithChildren<{
    /** default is 'orderly' */
    // brokerId?: string;
    /** default is TWType.normal */
    type?: TWType;
    titleConfig?: TitleConfig;
  }>
) => {
  // const { brokerId = "orderly" } = props;

  const brokerId = useConfig("brokerId");

  const {
    type = TWType.normal,
    titleConfig = {
      docOpenOptions: {
        url: "https://orderly.network/docs/introduction/tokenomics/trading-rewards",
        target: "_blank",
      },
    },
  } = props;
  const totalOrderClaimedReward = useGetClaimed(
    type === TWType.mm ? DistributionId.mmOrder : DistributionId.order
  );
  const totalEsOrderClaimedReward = useGetClaimed(
    type === TWType.mm ? DistributionId.mmEsOrder : DistributionId.esORder
  );

  const [brokers] = useAllBrokers();

  const [curEpochEstimate] = useCurEpochEstimate(type);

  const walletRewardsHistory = useWalletRewardsHistory(type);

  const epochList = useEpochInfo(type as TWType);

  const brokerName = useMemo(() => {
    return brokers?.[brokerId];
  }, [brokerId, brokers]);

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
        titleConfig,
        brokerId,
        brokerName,
        brokers,
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
