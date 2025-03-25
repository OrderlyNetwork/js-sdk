import { createContext, PropsWithChildren, useContext } from "react";

export type Campaign = {
  title: string;
  description: string;
  image: string;
  startTime: Date | string;
  endTime: Date | string;
  href:
    | string
    | {
        /** learn more url */
        learnMore: string;
        /** trading url, if provided, will override default trading now button url */
        trading: string;
      };
};

/**
 * Trading leaderboard provider state
 */
export type TradingLeaderboardState = {
  /** campaigns config, if not provided, will not show campaigns section */
  campaigns?: Campaign[];
  /** background src, it can be a image resource */
  backgroundSrc?: string;
  href?: {
    /** default trading now button url */
    trading: string;
  };
};

/**
 * Trading leaderboard context
 */
export const TradingLeaderboardContext = createContext<TradingLeaderboardState>(
  {} as TradingLeaderboardState
);

export type TradingLeaderboardProviderProps =
  PropsWithChildren<TradingLeaderboardState>;

export const TradingLeaderboardProvider = (
  props: TradingLeaderboardProviderProps
) => {
  return (
    <TradingLeaderboardContext.Provider
      value={{
        campaigns: props.campaigns,
        href: props.href,
        backgroundSrc: props.backgroundSrc,
      }}
    >
      {props.children}
    </TradingLeaderboardContext.Provider>
  );
};

export const useTradingLeaderboardContext = () => {
  return useContext(TradingLeaderboardContext);
};
