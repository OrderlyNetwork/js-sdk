import { createContext, PropsWithChildren, useContext, useState } from "react";
import { CampaignConfig } from "../campaigns/type";

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
  onCampaignChange: (campaignId: string) => void;
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

  return (
    <TradingLeaderboardContext.Provider
      value={{
        campaigns: props.campaigns,
        href: props.href,
        backgroundSrc: props.backgroundSrc,
        currentCampaignId,
        onCampaignChange: setCurrentCampaignId,
      }}
    >
      {props.children}
    </TradingLeaderboardContext.Provider>
  );
};

export const useTradingLeaderboardContext = () => {
  return useContext(TradingLeaderboardContext);
};
