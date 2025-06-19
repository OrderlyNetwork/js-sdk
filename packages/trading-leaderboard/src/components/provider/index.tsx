import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import { parseISO } from "date-fns";
import { sortWith, descend } from "ramda";
import { usePrivateQuery, RefferalAPI as API } from "@orderly.network/hooks";
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
};

/**
 * Trading leaderboard context
 */
export const TradingLeaderboardContext = createContext<TradingLeaderboardState>(
  {} as TradingLeaderboardState,
);

export type TradingLeaderboardProviderProps = PropsWithChildren<
  Pick<TradingLeaderboardState, "campaigns" | "href" | "backgroundSrc">
> & {
  campaignId?: string | number;
  onCampaignChange?: (campaignId: string | number) => void;
};

export const TradingLeaderboardProvider = (
  props: TradingLeaderboardProviderProps,
) => {
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
      setUserData({
        ...userData,
        referral_code: generateCode.code,
      } as UserData);
      generateCodeMutate();
    }
  }, [generateCode, generateCodeMutate, userData]);

  useEffect(() => {
    if (props.campaignId) {
      setCurrentCampaignId(props.campaignId as string);
    }
  }, [props.campaignId]);

  const currentCampaign = useMemo(() => {
    return props.campaigns?.find(
      (campaign) => campaign.campaign_id == currentCampaignId,
    );
  }, [props.campaigns, currentCampaignId]);

  const filteredCampaigns = useMemo(() => {
    const filtered = props.campaigns?.filter((campaign) => {
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
  }, [props.campaigns, userData]);

  const onCampaignChange = useCallback(
    (campaignId: string | number) => {
      setCurrentCampaignId(campaignId as string);
      props.onCampaignChange?.(campaignId);
    },
    [props.onCampaignChange],
  );

  return (
    <TradingLeaderboardContext.Provider
      value={{
        campaigns: filteredCampaigns,
        // campaigns: props.campaigns,
        href: props.href,
        backgroundSrc: props.backgroundSrc,
        currentCampaignId,
        currentCampaign,
        onCampaignChange,
        userData,
        setUserData,
        updatedTime,
        setUpdatedTime,
      }}
    >
      {props.children}
    </TradingLeaderboardContext.Provider>
  );
};

export const useTradingLeaderboardContext = () => {
  return useContext(TradingLeaderboardContext);
};
