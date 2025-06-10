import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";
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
  currentCampaign: CampaignConfig | undefined;
  onCampaignChange: (campaignId: string) => void;
  userData?: UserData;
  setUserData?: (userdata: UserData) => void;
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

  const currentCampaign = useMemo(() => {
    return props.campaigns?.find(
      (campaign) => campaign.campaign_id === currentCampaignId,
    );
  }, [props.campaigns, currentCampaignId]);

  return (
    <TradingLeaderboardContext.Provider
      value={{
        campaigns: props.campaigns,
        href: props.href,
        backgroundSrc: props.backgroundSrc,
        currentCampaignId,
        currentCampaign,
        onCampaignChange: setCurrentCampaignId,
        userData,
        setUserData,
      }}
    >
      {props.children}
    </TradingLeaderboardContext.Provider>
  );
};

export const useTradingLeaderboardContext = () => {
  return useContext(TradingLeaderboardContext);
};
