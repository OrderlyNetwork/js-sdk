import { createContext, PropsWithChildren, useContext } from "react";

export type Campaign = {
  title: string;
  description: string;
  image: string;
  startTime: Date | string;
  endTime: Date | string;
  href: string;
};

export type TradingLeaderboardState = {
  campaigns: Campaign[];
};

export const TradingLeaderboardContext = createContext<TradingLeaderboardState>(
  {} as TradingLeaderboardState
);

export type TradingLeaderboardProviderProps = PropsWithChildren<
  Pick<TradingLeaderboardState, "campaigns">
>;

export const TradingLeaderboardProvider = (
  props: TradingLeaderboardProviderProps
) => {
  return (
    <TradingLeaderboardContext.Provider
      value={{
        campaigns: props.campaigns,
      }}
    >
      {props.children}
    </TradingLeaderboardContext.Provider>
  );
};

export const useTradingLeaderboardContext = () => {
  return useContext(TradingLeaderboardContext);
};
