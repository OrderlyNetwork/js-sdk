import { useMemo, useContext, useRef, useEffect } from "react";
import {
  useAllBrokers,
  useConfig,
  useCurEpochEstimate,
  useEpochInfo,
  useGetClaimed,
  useAccount,
  RefferalAPI as API,
  usePrivateQuery,
} from "@orderly.network/hooks";
import { DistributionId, TWType } from "@orderly.network/hooks";
import { useAppContext } from "@orderly.network/react-app";
import { AccountStatusEnum } from "@orderly.network/types";
import { OverviewContext } from "../providers/overviewCtx";

export const useRewardsData = ({ type = TWType.normal }: { type?: TWType }) => {
  const totalOrderClaimedReward = useGetClaimed(
    type === TWType.mm ? DistributionId.mmOrder : DistributionId.order,
  );
  const [curEpochEstimate] = useCurEpochEstimate(type);
  const [brokers] = useAllBrokers();
  const { state } = useAccount();
  const { data, mutate } = usePrivateQuery<API.ReferralInfo>(
    "/v1/referral/info",
    {
      revalidateOnFocus: true,
    },
  );

  const epochList = useEpochInfo(type as TWType);
  const brokerId = useConfig("brokerId");
  const brokerName = useMemo(() => {
    return brokers?.[brokerId];
  }, [brokerId, brokers]);

  const lastStete = useRef<AccountStatusEnum>(AccountStatusEnum.NotConnected);

  useEffect(() => {
    let timerId: any;
    if (lastStete.current !== state.status) {
      lastStete.current = state.status;
      timerId = setTimeout(() => {
        mutate();
      }, 1000);
    }

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [state.status]);

  return {
    totalOrderClaimedReward,
    curEpochEstimate,
    epochList,
    brokerName,
    referralInfo: data,
  };
};

export const useRewardsDataScript = () => {
  const {
    totalOrderClaimedReward,
    curEpochEstimate,
    epochList,
    brokerName,
    referralInfo,
  } = useContext(OverviewContext);
  const { state } = useAccount();
  const { wrongNetwork } = useAppContext();
  const isSignIn =
    state.status === AccountStatusEnum.EnableTrading ||
    state.status === AccountStatusEnum.EnableTradingWithoutConnected;

  return {
    totalOrderClaimedReward,
    curEpochEstimate,
    epochList,
    brokerName,
    isSignIn,
    referralInfo,
    wrongNetwork,
  };
};

export type UseRewardsDataReturn = ReturnType<typeof useRewardsData>;
