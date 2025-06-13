import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";
import { sortWith, descend, prop } from "ramda";
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
  /** campaign leaderboard ranking snapshot time */
  updatedTime?: number;
  /** set snapshot time */
  setUpdatedTime?: (updatedTime: number) => void;
};

/**
 * Trading leaderboard context
 */
export const TradingLeaderboardContext = createContext<TradingLeaderboardState>(
  {} as TradingLeaderboardState,
);

export type TradingLeaderboardProviderProps = PropsWithChildren<
  Pick<TradingLeaderboardState, "campaigns" | "href" | "backgroundSrc">
>;

export const TradingLeaderboardProvider = (
  props: TradingLeaderboardProviderProps,
) => {
  const [currentCampaignId, setCurrentCampaignId] = useState<string>("general");
  const [userData, setUserData] = useState<UserData>();
  const [updatedTime, setUpdatedTime] = useState<number>();

  const currentCampaign = useMemo(() => {
    return props.campaigns?.find(
      (campaign) => campaign.campaign_id == currentCampaignId,
    );
  }, [props.campaigns, currentCampaignId]);

  const filteredCampaigns = useMemo(() => {
    const filtered = props.campaigns?.filter((campaign) => {
      // Campaign without referral_codes is visible to all users
      if (!campaign.referral_codes) {
        return true;
      }

      return campaign.referral_codes?.includes(userData?.referral_code || "");
    });

    // Using ramda for descending time sort
    return filtered
      ? sortWith([descend(prop("end_time"))], filtered)
      : filtered;
  }, [props.campaigns, userData]);

  return (
    <TradingLeaderboardContext.Provider
      value={{
        campaigns: filteredCampaigns,
        // campaigns: props.campaigns,
        href: props.href,
        backgroundSrc: props.backgroundSrc,
        currentCampaignId,
        currentCampaign,
        onCampaignChange: setCurrentCampaignId,
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
