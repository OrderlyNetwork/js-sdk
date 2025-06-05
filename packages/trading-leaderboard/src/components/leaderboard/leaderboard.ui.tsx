import { FC } from "react";
import { cn, Flex } from "@orderly.network/ui";
import { TradingListWidget } from "../tradingList";
import { TradingFilter } from "./components/TradingFilter";
import { LeaderboardScriptReturn } from "./leaderboard.script";

export type LeaderboardProps = {
  style?: React.CSSProperties;
  className?: string;
} & LeaderboardScriptReturn;

export const Leaderboard: FC<LeaderboardProps> = (props) => {
  return (
    <Flex
      direction="column"
      gapY={5}
      height="100%"
      className={cn(
        "oui-trading-leaderboard oui-relative",
        "oui-mx-auto oui-max-w-[1040px] oui-px-3 ",
      )}
    >
      <TradingFilter {...props} />
      <TradingListWidget
        dateRange={props.dateRange}
        address={props.searchValue}
      />
    </Flex>
  );
};
