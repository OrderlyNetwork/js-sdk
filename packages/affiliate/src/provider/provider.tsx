import {
  FC,
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { format, subDays } from "date-fns";
import {
  RefferalAPI as API,
  usePrivateQuery,
  useDaily,
  useAccount,
  useMemoizedFn,
  noCacheConfig,
} from "@orderly.network/hooks";
import { useAppContext } from "@orderly.network/react-app";
import { AccountStatusEnum } from "@orderly.network/types";
import {
  ReferralContext,
  ReferralContextProps,
  ReferralContextReturns,
  TabTypes,
  UserVolumeType,
} from "./context";

export const ReferralProvider: FC<PropsWithChildren<ReferralContextProps>> = (
  props,
) => {
  const {
    becomeAnAffiliateUrl = "https://orderly.network/",
    learnAffiliateUrl = "https://orderly.network/",
    referralLinkUrl = "https://orderly.network/",
    chartConfig,
    overwrite,
    children,
    splashPage,
    onBecomeAnAffiliate,
    bindReferralCodeState,
    onLearnAffiliate,
    showReferralPage,
  } = props;

  const { state } = useAccount();

  const {
    data,
    mutate: referralInfoMutate,
    isLoading,
  } = usePrivateQuery<API.ReferralInfo>("/v1/referral/info", {
    revalidateOnFocus: true,
    errorRetryCount: 3,
    ...noCacheConfig,
  });

  const { data: generateCode, mutate: generateCodeMutate } =
    usePrivateQuery<API.AutoGenerateCode>(
      "/v1/referral/auto_referral/progress",
      {
        revalidateOnFocus: true,
        errorRetryCount: 2,
        formatter: (data) => {
          return {
            code: data.auto_referral_code,
            requireVolume: data.required_volume,
            completedVolume: data.completed_volume,
          };
        },
      },
    );

  const [showHome, setShowHome] = useState(isLoading);

  useEffect(() => {
    setShowHome(true);
  }, [isLoading]);

  const { data: dailyVolume, mutate: dailyVolumeMutate } = useDaily({
    startDate: subDays(new Date(), 1),
    endDate: subDays(new Date(), 90),
  });

  const { data: volumeStatistics, mutate: volumeStatisticsMutate } =
    usePrivateQuery<API.UserVolStats>("/v1/volume/user/stats", {
      revalidateOnFocus: true,
    });

  const isAffiliate = useMemo(() => {
    return (data?.referrer_info?.referral_codes?.length || 0) > 0;
  }, [data?.referrer_info]);

  const isTrader = useMemo(() => {
    return (data?.referee_info?.referer_code?.length || 0) > 0;
  }, [data?.referee_info]);

  const userVolume = useMemo<UserVolumeType>(() => {
    const volume: UserVolumeType = {};
    if (dailyVolume && dailyVolume.length > 0) {
      const now = format(new Date(), "yyyy-MM-dd");
      const index = dailyVolume.findIndex((item) => item.date === now);
      let oneDayVolume = 0;
      if (index !== -1) {
        oneDayVolume = dailyVolume[index].perp_volume;
      }
      volume["1d_volume"] = oneDayVolume;
    }

    if (volumeStatistics) {
      volume["7d_volume"] = volumeStatistics.perp_volume_last_7_days;
      volume["30d_volume"] = volumeStatistics.perp_volume_last_30_days;
      volume["all_volume"] = volumeStatistics.perp_volume_ltd;
    }
    return volume;
  }, [dailyVolume, volumeStatistics]);

  useEffect(() => {
    if (isAffiliate || isTrader) {
      setShowHome(false);
    }
  }, [isAffiliate, isTrader]);

  const memoMutate = useMemoizedFn(() => {
    volumeStatisticsMutate();
    dailyVolumeMutate();
    referralInfoMutate();
    generateCodeMutate();
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const refCode = searchParams.get("ref");
    if (refCode) {
      localStorage.setItem("referral_code", refCode);
    }
  }, []);

  const [tab, setTab] = useState<TabTypes>(TabTypes.affiliate);

  const { wrongNetwork, disabledConnect } = useAppContext();

  const lastStete = useRef<AccountStatusEnum>(AccountStatusEnum.NotConnected);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (lastStete.current !== state.status) {
      lastStete.current = state.status;
      timerRef.current = setTimeout(() => {
        memoMutate();
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [memoMutate, state.status]);

  const memoizedValue = useMemo<ReferralContextReturns>(() => {
    return {
      generateCode,
      showHome,
      referralInfo: data,
      isAffiliate: isAffiliate,
      isTrader: isTrader,
      tab,
      becomeAnAffiliateUrl,
      learnAffiliateUrl,
      referralLinkUrl,
      userVolume,
      dailyVolume,
      chartConfig,
      overwrite,
      isLoading,
      wrongNetwork,
      disabledConnect,
      setShowHome,
      setTab: setTab,
      mutate: memoMutate,
      onBecomeAnAffiliate,
      bindReferralCodeState,
      onLearnAffiliate,
      showReferralPage,
      splashPage,
    };
  }, [
    becomeAnAffiliateUrl,
    chartConfig,
    dailyVolume,
    data,
    disabledConnect,
    generateCode,
    isAffiliate,
    isLoading,
    isTrader,
    learnAffiliateUrl,
    overwrite,
    referralLinkUrl,
    showHome,
    tab,
    userVolume,
    wrongNetwork,
    onBecomeAnAffiliate,
    bindReferralCodeState,
    onLearnAffiliate,
    showReferralPage,
    splashPage,
    memoMutate,
  ]);

  return (
    <ReferralContext.Provider value={memoizedValue}>
      {children}
    </ReferralContext.Provider>
  );
};
