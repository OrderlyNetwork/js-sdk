import { FC } from "react";
import { cn, Flex } from "@orderly.network/ui";
import { TradingListWidget } from "../../components/tradingList/widget";
import { CampaignsWidget } from "../../components/campaigns";

export type LeaderboardProps = {
  className?: string;
};

export const Leaderboard: FC<LeaderboardProps> = (props) => {
  return (
    <Flex
      direction="column"
      gapY={5}
      height="100%"
      className={cn(
        "oui-trading-leaderboard oui-max-w-[1040px] oui-mx-auto",
        props.className
      )}
    >
      <CampaignsWidget />
      <TradingListWidget className="oui-h-[calc(100%_-_280px_-_20px)]" />
    </Flex>
  );
};
