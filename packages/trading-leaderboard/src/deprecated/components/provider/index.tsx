import React, { createContext, useContext, useMemo } from "react";

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
  /** background src, it can be a image resource or video resource */
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
  {},
);

export type TradingLeaderboardProviderProps =
  React.PropsWithChildren<TradingLeaderboardState>;

export const TradingLeaderboardProvider: React.FC<
  Readonly<TradingLeaderboardProviderProps>
> = (props) => {
  const { href, campaigns, backgroundSrc, children } = props;
  const memoizedValue = useMemo<TradingLeaderboardState>(() => {
    return {
      href: href,
      campaigns: campaigns,
      backgroundSrc: backgroundSrc,
    };
  }, [href, campaigns, backgroundSrc]);
  return (
    <TradingLeaderboardContext.Provider value={memoizedValue}>
      {children}
    </TradingLeaderboardContext.Provider>
  );
};

export const useTradingLeaderboardContext = () => {
  return useContext(TradingLeaderboardContext);
};
