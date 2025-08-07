import {
  FC,
  PropsWithChildren,
  ReactNode,
  createContext,
  useEffect,
  useMemo,
} from "react";
import { IntlProvider } from "react-intl";
import type { MessageFormatElement } from "react-intl";
import { pick } from "ramda";
import {
  RefferalAPI as API,
  usePrivateQuery,
  useDaily,
  useMemoizedFn,
} from "@orderly.network/hooks";
import { XAxis, YAxis, BarStyle } from "../components";
import { en } from "../locale/en-US";
import { formatYMDTime } from "../utils/utils";

export type UserVolumeType = {
  "1d_volume"?: number;
  "7d_volume"?: number;
  "30d_volume"?: number;
  all_volume?: number;
};

export type OverwiteCard = {
  ref?: BuildNode;
  refClassName?: string;
  refIcon?: ReactNode;
  trader?: BuildNode;
  traderClassName?: string;
  traderIcon?: ReactNode;
};

export type Overwrite = {
  ref?: {
    gradientTitle?: string;
    top?: BuildNode;
    card?: ReactNode | OverwiteCard;
    step?:
      | BuildNode
      | { applyIcon?: ReactNode; shareIcon?: ReactNode; earnIcon?: ReactNode };
  };
};

export type ChartConfig = {
  affiliate: {
    bar?: BarStyle;
    yAxis?: YAxis;
    xAxis?: XAxis;
  };
  trader: {
    bar?: BarStyle;
    yAxis?: YAxis;
    xAxis?: XAxis;
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
  onEnterTraderPage?: (params?: any) => void;
  onEnterAffiliatePage?: (params?: any) => void;
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
} & ReferralContextProps;

export const ReferralContext = createContext<ReferralContextReturns>(
  {} as ReferralContextReturns,
);

export type BuildNode = (state: ReferralContextReturns) => ReactNode;

// Default noop function to avoid undefined errors
const noop = () => {};

export const ReferralProvider: FC<
  PropsWithChildren<
    ReferralContextProps & {
      intl?: {
        messages?:
          | Record<string, string>
          | Record<string, MessageFormatElement[]>;
        locale: string;
        defaultLocale?: string;
      };
    }
  >
> = (props) => {
  const {
    becomeAnAffiliateUrl = "https://orderly.network/",
    learnAffiliateUrl = "https://orderly.network/",
    referralLinkUrl = "https://orderly.network/",
    overwrite,
    chartConfig,
    intl = { messages: en, locale: "en", defaultLocale: "en" },
    children,
    splashPage = noop as () => React.ReactNode,
    onBecomeAnAffiliate = noop,
    bindReferralCodeState = noop,
    onLearnAffiliate = noop,
    showReferralPage = noop,
    onEnterTraderPage = noop,
    onEnterAffiliatePage = noop,
  } = props;

  const {
    data,
    mutate: referralInfoMutate,
    isLoading,
  } = usePrivateQuery<API.ReferralInfo>("/v1/referral/info", {
    revalidateOnFocus: true,
  });

  const { data: dailyVolume, mutate: dailyVolumeMutate } = useDaily();

  const { data: volumeStatistics, mutate: volumeStatisticsMutate } =
    usePrivateQuery<API.UserVolStats>("/v1/volume/user/stats", {
      revalidateOnFocus: true,
    });

  const isAffiliate = useMemo(() => {
    return (data?.referrer_info?.referral_codes?.length || 0) > 0;
  }, [data?.referrer_info]);

  const isTrader = useMemo(() => {
    return (data?.referee_info.referer_code?.length || 0) > 0;
  }, [data?.referee_info]);

  const userVolume = useMemo<UserVolumeType>(() => {
    const volume: UserVolumeType = {};
    if (dailyVolume && dailyVolume.length > 0) {
      const now = formatYMDTime(new Date().toLocaleDateString());
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

  const memoMutate = useMemoizedFn(() => {
    volumeStatisticsMutate();
    dailyVolumeMutate();
    referralInfoMutate();
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const refCode = searchParams.get("ref");
    if (refCode) {
      localStorage.setItem("referral_code", refCode);
    }
  }, []);

  const memoBecomeAnAffiliate = useMemoizedFn(onBecomeAnAffiliate);
  const memoBindReferralCodeState = useMemoizedFn(bindReferralCodeState);
  const memoLearnAffiliate = useMemoizedFn(onLearnAffiliate);
  const memoShowReferralPage = useMemoizedFn(showReferralPage);
  const memoEnterTraderPage = useMemoizedFn(onEnterTraderPage);
  const memoEnterAffiliatePage = useMemoizedFn(onEnterAffiliatePage);
  const memoSplashPage = useMemoizedFn(splashPage);

  const memoizedValue = useMemo<ReferralContextReturns>(() => {
    return {
      referralInfo: data,
      isAffiliate: isAffiliate,
      isTrader: isTrader,
      becomeAnAffiliateUrl,
      learnAffiliateUrl,
      referralLinkUrl,
      userVolume,
      dailyVolume,
      chartConfig,
      overwrite,
      isLoading,
      showReferralPage: memoShowReferralPage,
      onEnterTraderPage: memoEnterTraderPage,
      onEnterAffiliatePage: memoEnterAffiliatePage,
      splashPage: memoSplashPage,
      mutate: memoMutate,
      onBecomeAnAffiliate: memoBecomeAnAffiliate,
      bindReferralCodeState: memoBindReferralCodeState,
      onLearnAffiliate: memoLearnAffiliate,
    };
  }, [
    becomeAnAffiliateUrl,
    chartConfig,
    dailyVolume,
    data,
    isAffiliate,
    isLoading,
    isTrader,
    learnAffiliateUrl,
    overwrite,
    referralLinkUrl,
    userVolume,
    memoBecomeAnAffiliate,
    memoBindReferralCodeState,
    memoEnterAffiliatePage,
    memoEnterTraderPage,
    memoLearnAffiliate,
    memoShowReferralPage,
    memoSplashPage,
    memoMutate,
  ]);

  return (
    <IntlProvider {...pick(["messages", "locale", "defaultLocale"], intl)}>
      <ReferralContext.Provider value={memoizedValue}>
        {children}
      </ReferralContext.Provider>
    </IntlProvider>
  );
};
