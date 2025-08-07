import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { parseISO } from "date-fns";
import { sortWith, descend } from "ramda";
import {
  usePrivateQuery,
  RefferalAPI as API,
  useMemoizedFn,
} from "@orderly.network/hooks";
import { CampaignConfig, UserData } from "../campaigns/type";

/**
 * Trading leaderboard provider state
 */
export type TradingLeaderboardState = {
  /** campaigns config, if not provided, will not show campaigns section */
  campaigns?: CampaignConfig[];
  /** background src, it can be a image resource or video resource */
  backgroundSrc?: string;
  href?: {
    /** default trading now button url */
    trading: string;
  };
  currentCampaignId: string;
  currentCampaign?: CampaignConfig;
  onCampaignChange: (campaignId: string) => void;
  /** leaderboard user data, it will be used to calculate the rewards */
  userData?: UserData;
  /** set leaderboard user data */
  setUserData?: (userdata: UserData) => void;
  /** campaign ranking list updated time */
  updatedTime?: number;
  /** set snapshot time */
  setUpdatedTime?: (updatedTime?: number) => void;
  /** custom data, if use this, you can full control the data */
  dataAdapter?: (info: { page: number; pageSize: number }) => {
    loading: boolean;
    dataSource?: any[];
    dataList?: any[];
    userData?: any;
    updatedTime?: number;
    meta?: {
      total: number;
      current_page: number;
      records_per_page: number;
    };
  };
};

/**
 * Trading leaderboard context
 */
export const TradingLeaderboardContext = createContext<TradingLeaderboardState>(
  {} as TradingLeaderboardState,
);

export type TradingLeaderboardProviderProps = Pick<
  TradingLeaderboardState,
  "campaigns" | "href" | "backgroundSrc" | "dataAdapter"
> & {
  campaignId?: string | number;
  onCampaignChange?: (campaignId: string | number) => void;
};

export const TradingLeaderboardProvider: React.FC<
  React.PropsWithChildren<TradingLeaderboardProviderProps>
> = (props) => {
  const {
    campaignId,
    campaigns,
    backgroundSrc,
    href,
    children,
    dataAdapter,
    onCampaignChange,
  } = props;

  const [currentCampaignId, setCurrentCampaignId] = useState<string>("general");
  const [userData, setUserData] = useState<UserData>();
  const [updatedTime, setUpdatedTime] = useState<number>();

  const { data: generateCode, mutate: generateCodeMutate } =
    usePrivateQuery<API.AutoGenerateCode>(
      "/v1/referral/auto_referral/progress",
      {
        revalidateOnFocus: false,
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

  useEffect(() => {
    if (generateCode?.code && userData?.referral_code != generateCode.code) {
      setUserData({ ...userData!, referral_code: generateCode.code });
      generateCodeMutate();
    }
  }, [userData, generateCode, generateCodeMutate]);

  useEffect(() => {
    if (campaignId) {
      setCurrentCampaignId(campaignId as string);
    }
  }, [campaignId]);

  const currentCampaign = useMemo(() => {
    return campaigns?.find(
      (campaign) => campaign.campaign_id == currentCampaignId,
    );
  }, [campaigns, currentCampaignId]);

  const filteredCampaigns = useMemo(() => {
    const filtered = campaigns?.filter((campaign) => {
      // return true;
      // Campaign without referral_codes is visible to all users
      if (!campaign.referral_codes) {
        return true;
      }
      return campaign.referral_codes?.includes(userData?.referral_code || "");
    });

    // Using date-fns to parse date strings and sort by end_time in descending order
    return filtered
      ? sortWith(
          [descend((campaign: CampaignConfig) => parseISO(campaign.end_time))],
          filtered,
        )
      : filtered;
  }, [campaigns, userData]);

  const memoCampaignChange = useMemoizedFn((id: string | number) => {
    setCurrentCampaignId(id as string);
    onCampaignChange?.(id);
  });

  const memoizedValue = useMemo<TradingLeaderboardState>(() => {
    return {
      campaigns: filteredCampaigns,
      href: href,
      backgroundSrc: backgroundSrc,
      currentCampaignId,
      currentCampaign,
      updatedTime,
      userData,
      setUserData,
      onCampaignChange: memoCampaignChange,
      setUpdatedTime: setUpdatedTime,
      dataAdapter: dataAdapter,
    };
  }, [
    backgroundSrc,
    currentCampaign,
    currentCampaignId,
    filteredCampaigns,
    href,
    updatedTime,
    userData,
    dataAdapter,
    memoCampaignChange,
  ]);

  return (
    <TradingLeaderboardContext.Provider value={memoizedValue}>
      {children}
    </TradingLeaderboardContext.Provider>
  );
};

export const useTradingLeaderboardContext = () => {
  const ctx = useContext<TradingLeaderboardState>(TradingLeaderboardContext);
  return ctx;
};
