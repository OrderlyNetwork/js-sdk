import { FC } from "react";
import { cn, Flex } from "@orderly.network/ui";
import { TradingListWidget } from "../../components/tradingList/widget";
import { CampaignsWidget } from "../../components/campaigns";
import { LeaderboardScriptReturn } from "./leaderboard.script";
import { BottomNavBarWidget } from "@orderly.network/trading";

export type LeaderboardProps = {
  style?: React.CSSProperties;
  className?: string;
} & LeaderboardScriptReturn;

export const MobileLeaderboardWidget: FC<LeaderboardProps> = (props) => {
  return (
    <div
      style={{
        paddingBottom: "calc(64px + env(safe-area-inset-bottom))",
      }}
      className="oui-grid oui-grid-rows-[auto,1fr,auto] oui-h-screen oui-gap-1 oui-relative oui-bg-base-10"
    >
      <Flex
        direction="column"
        gapY={3}
        height="100%"
        px={3}
        pt={3}
        pb={5}
        className={cn(
          "oui-trading-leaderboard-mobile oui-overflow-y-auto oui-h-[calc(100vh_-_64px)]"
        )}
      >
        {props.showCampaigns && <CampaignsWidget />}
        <TradingListWidget />
        <div className="oui-fixed oui-left-0 oui-right-0 oui-bottom-0">
          <BottomNavBarWidget />
        </div>
      </Flex>
    </div>
  );
};
