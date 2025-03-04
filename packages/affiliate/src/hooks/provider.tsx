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
// import { XAxis, YAxis, BarStyle } from "../components";
import { formatYMDTime } from "../utils/utils";
import { IntlProvider, MessageFormatElement } from "react-intl";
import { en } from "../locale/en-US";
import {
  RefferalAPI as API,
  usePrivateQuery,
  useDaily,
  useAccount,
} from "@orderly.network/hooks";
import { format, subDays } from "date-fns";
import { useAppContext } from "@orderly.network/react-app";
import { AccountStatusEnum } from "@orderly.network/types";

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
    queryParams: any
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
} & ReferralContextProps;

export const ReferralContext = createContext<ReferralContextReturns>(
  {} as ReferralContextReturns
);

export type BuildNode = (state: ReferralContextReturns) => ReactNode;

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
    onBecomeAnAffiliate: becomeAnAffiliate,
    becomeAnAffiliateUrl = "https://orderly.network/",
    bindReferralCodeState,
    onLearnAffiliate: learnAffiliate,
    learnAffiliateUrl = "https://orderly.network/",
    referralLinkUrl = "https://orderly.network/",
    showReferralPage,
    // onEnterTraderPage: enterTraderPage,
    // onEnterAffiliatePage: enterAffiliatePage,
    chartConfig,
    intl = {
      messages: en,
      locale: "en",
      defaultLocale: "en",
    },
    overwrite,
    splashPage,
  } = props;

  const { state } = useAccount();

  const {
    data,
    mutate: referralInfoMutate,
    isLoading,
  } = usePrivateQuery<API.ReferralInfo>("/v1/referral/info", {
    revalidateOnFocus: true,
  });

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
    return (data?.referee_info.referer_code?.length || 0) > 0;
  }, [data?.referee_info]);

  const userVolume = useMemo(() => {
    const volume: any = {};

    if (dailyVolume && dailyVolume.length > 0) {
      const now = format(new Date(), "yyyy-MM-dd");
      const index = dailyVolume.findIndex((item: any) => {
        const itemDate = item.date;
        return itemDate === now;
      });
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

  const mutate = () => {
    volumeStatisticsMutate();
    dailyVolumeMutate();
    referralInfoMutate();
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const refCode = searchParams.get("ref");
    if (refCode) {
      localStorage.setItem("referral_code", refCode);
    }
  }, []);

  const { messages, locale, defaultLocale } = intl;

  const [tab, setTab] = useState<TabTypes>(TabTypes.affiliate);

  const { wrongNetwork, disabledConnect } = useAppContext();

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

  return (
    <IntlProvider
      messages={messages}
      locale={locale}
      defaultLocale={defaultLocale}
    >
      <ReferralContext.Provider
        value={{
          showHome,
          setShowHome,
          referralInfo: data,
          isAffiliate: isAffiliate,
          isTrader: isTrader,
          // isAffiliate: true,
          // isTrader: false,
          mutate,
          onBecomeAnAffiliate: becomeAnAffiliate,
          becomeAnAffiliateUrl,
          bindReferralCodeState,
          onLearnAffiliate: learnAffiliate,
          learnAffiliateUrl,
          referralLinkUrl,
          userVolume,
          dailyVolume,
          showReferralPage,
          chartConfig,
          overwrite,
          splashPage,
          isLoading,
          tab,
          setTab,
          wrongNetwork,
          disabledConnect,
        }}
      >
        {props.children}
      </ReferralContext.Provider>
    </IntlProvider>
  );
};

export function useReferralContext() {
  return useContext(ReferralContext);
}
