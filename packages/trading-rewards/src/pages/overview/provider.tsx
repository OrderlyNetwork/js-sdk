import { PropsWithChildren, createContext, useContext } from "react";
import { TWType, EpochInfoType, useEpochInfo, useAllBrokers } from "@orderly.network/hooks";

export type TradingRewardsState = {
    type: TWType;
    epochList: EpochInfoType;
  };
  
  export const TradingRewardsContext = createContext<TradingRewardsState>({
    type: TWType.normal,
    epochList: {
      data: undefined,
      curEpochInfo: undefined,
      isUnstart: false,
      refresh: () => {},
    },
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
    // const totalOrderClaimedReward = useGetClaimed(
    //   type === TWType.mm ? DistributionId.dmmOrder : DistributionId.order
    // );
    // const totalEsOrderClaimedReward = useGetClaimed(
    //   type === TWType.mm ? DistributionId.dmmEsOrder : DistributionId.esORder
    // );

    const brokers = useAllBrokers();

    console.log("brokers", brokers);
  
  
    const epochList = useEpochInfo(type as TWType);
    return (
      <TradingRewardsContext.Provider
        value={{
          type: type as TWType,
        //   totalOrderClaimedReward,
        //   totalEsOrderClaimedReward,
          // totalOrderClaimedReward: 2000,
          // totalEsOrderClaimedReward: 0,
          epochList,
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
  