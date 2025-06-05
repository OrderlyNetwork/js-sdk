import { FC } from "react";
import { Flex } from "@orderly.network/ui";
import { TradingListWidget } from "../tradingList";
import { TradingFilter } from "./components/TradingFilter";
import { LeaderboardScriptReturn } from "./leaderboard.script";

export type LeaderboardProps = {
  style?: React.CSSProperties;
  className?: string;
} & LeaderboardScriptReturn;

export const MobileLeaderboardWidget: FC<LeaderboardProps> = (props) => {
  return (
    <div>
      <Flex direction="column" gapY={3} height="100%" px={3} pt={3} pb={3}>
        <TradingFilter {...props} />

        <TradingListWidget
          dateRange={props.dateRange}
          address={props.searchValue}
        />
      </Flex>
    </div>
  );
};
