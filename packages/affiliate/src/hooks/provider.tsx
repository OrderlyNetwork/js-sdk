import {
  FC,
  PropsWithChildren,
  ReactNode,
  createContext,
  useContext,
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
} from "@orderly.network/hooks";
import { useAppContext } from "@orderly.network/react-app";
import { AccountStatusEnum, EMPTY_OPERATION } from "@orderly.network/types";

export enum TabTypes {
  affiliate = "affiliate",
  trader = "trader",
}

export type UserVolumeType = {
  "1d_volume"?: number;
  "7d_volume"?: number;
  "30d_volume"?: number;
  all_volume?: number;
};

// export type OverwiteCard = {
//     ref?: BuildNode,
//     refClassName?: string,
//     refIcon?: ReactNode,

//     trader?: BuildNode,
//     traderClassName?: string,
//     traderIcon?: ReactNode,
// }

export type Overwrite = {
  shortBrokerName?: string;
  brokerName?: string;
  ref?: {
    top?: BuildNode;
    card?: BuildNode;
    step?: BuildNode;
  };
};

export type ChartConfig = {
  // affiliate: {
  //     bar?: BarStyle,
  //     yAxis?: YAxis,
  //     xAxis?: XAxis,
  // },
  // trader: {
  //     bar?: BarStyle,
  //     yAxis?: YAxis,
  //     xAxis?: XAxis,
  // }
  affiliate: {
    bar?: any;
    yAxis?: any;
    xAxis?: any;
  };
  trader: {
    bar?: any;
    yAxis?: any;
    xAxis?: any;
  };
};

export type ReferralContextProps = {
  //** click become an affiliate, If this method is implemented, the `becomeAnAffiliateUrl` will not work */
  onBecomeAnAffiliate?: () => void;
  //** set become an affiliate url, default is `https://orderly.network/` */
  becomeAnAffiliateUrl?: string;
  //** bind refferal code callback */
  bindReferralCodeState?: (
    success: boolean,
    error: any,
    hide: any,
    queryParams: any,
  ) => void;
  //** click learn affilate, if this method is implemented, the `learnAffilateUrl` will not work */
  onLearnAffiliate?: () => void;
  //** set learn affiliate url, default is `https://orderly.network/` */
  learnAffiliateUrl?: string;
  //** default is `https://orderly.network/` */
  referralLinkUrl: string;
  //** referral index page */
  showReferralPage?: () => void;
  // onEnterTraderPage?: (params?: any) => void,
  // onEnterAffiliatePage?: (params?: any) => void,
  //** tab + tab content */
  showDashboard?: () => void;
  //** col chart config */
  chartConfig?: ChartConfig;
  //** overwrite refferal */
  overwrite?: Overwrite;
  //** build a splash page, if not impletement, will be dispaly referral page */
  splashPage?: () => ReactNode;
};

export type ReferralContextReturns = {
  referralInfo?: API.ReferralInfo;
  isAffiliate: boolean;
  isTrader: boolean;
  mutate: any;
  userVolume?: UserVolumeType;
  dailyVolume?: API.DayliVolume[];
  isLoading: boolean;
  showHome: boolean;
  setShowHome: (value: boolean) => void;
  tab: TabTypes;
  setTab: React.Dispatch<React.SetStateAction<TabTypes>>;
  wrongNetwork: boolean;
  disabledConnect: boolean;
  generateCode: API.AutoGenerateCode | undefined;
} & ReferralContextProps;

export const ReferralContext = createContext<ReferralContextReturns>(
  {} as ReferralContextReturns,
);

export type BuildNode = (state: ReferralContextReturns) => ReactNode;

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
    splashPage = EMPTY_OPERATION as () => React.ReactNode,
    onBecomeAnAffiliate = EMPTY_OPERATION,
    bindReferralCodeState = EMPTY_OPERATION,
    onLearnAffiliate = EMPTY_OPERATION,
    showReferralPage = EMPTY_OPERATION,
  } = props;

  const { state } = useAccount();

  const {
    data,
    mutate: referralInfoMutate,
    isLoading,
  } = usePrivateQuery<API.ReferralInfo>("/v1/referral/info", {
    revalidateOnFocus: true,
    revalidateOnMount: true,
    dedupingInterval: 0,
    errorRetryCount: 3,
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

  const memoBecomeAnAffiliate = useMemoizedFn(onBecomeAnAffiliate);
  const memoBindReferralCodeState = useMemoizedFn(bindReferralCodeState);
  const memoLearnAffiliate = useMemoizedFn(onLearnAffiliate);
  const memoShowReferralPage = useMemoizedFn(showReferralPage);
  const memoSplashPage = useMemoizedFn(splashPage);

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
      onBecomeAnAffiliate: memoBecomeAnAffiliate,
      bindReferralCodeState: memoBindReferralCodeState,
      onLearnAffiliate: memoLearnAffiliate,
      showReferralPage: memoShowReferralPage,
      splashPage: memoSplashPage,
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
    memoBecomeAnAffiliate,
    memoBindReferralCodeState,
    memoLearnAffiliate,
    memoShowReferralPage,
    memoSplashPage,
    memoMutate,
  ]);

  return (
    <ReferralContext.Provider value={memoizedValue}>
      {children}
    </ReferralContext.Provider>
  );
};

export const useReferralContext = () => {
  return useContext(ReferralContext);
};
