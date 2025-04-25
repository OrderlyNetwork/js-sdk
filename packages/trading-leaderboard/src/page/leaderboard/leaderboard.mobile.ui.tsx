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
  const renderBackground = () => {
    const linearGradient =
      "linear-gradient(180deg, rgba(var(--oui-color-base-10) / 0.3) 0%, rgba(var(--oui-color-base-10) / 0) 70%, rgba(var(--oui-color-base-10) / 1) 100%)";

    if (props.isVideo) {
      return (
        <div
          className={cn(
            "oui-absolute oui-top-0 oui-left-0",
            "oui-w-full oui-h-full"
          )}
        >
          <div
            style={{
              backgroundImage: linearGradient,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}
            className={cn(
              "oui-absolute oui-top-0 oui-left-0",
              "oui-w-full oui-h-full"
            )}
          />
          <video
            playsInline
            webkit-playsinline
            autoPlay
            loop
            muted
            className={cn(
              // rest style
              "oui-border-none oui-outline-none oui-bg-transparent oui-pointer-events-none",
              "oui-w-full oui-h-full",
              // "oui-absolute oui-top-0 oui-left-0",
              "oui-object-cover",
              "oui-opacity-50"
            )}
          >
            <source src={props.backgroundSrc} type="video/mp4" />
            <source src={props.backgroundSrc} type="video/webm" />
            <source src={props.backgroundSrc} type="video/ogg" />
            <source src={props.backgroundSrc} type="video/avi" />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (props.backgroundSrc) {
      return (
        <div
          style={{
            backgroundImage: `${linearGradient}, url(${props.backgroundSrc}) `,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
          className={cn(
            "oui-absolute oui-top-0 oui-left-0",
            "oui-w-full oui-h-full",
            "oui-opacity-50"
          )}
        />
      );
    }
  };
  return (
    <div
      style={{
        paddingBottom: "calc(64px + env(safe-area-inset-bottom))",
      }}
      className={cn(
        "oui-grid oui-grid-rows-[auto,1fr,auto] oui-h-screen oui-gap-1 oui-relative oui-bg-base-10",
        "oui-relative oui-h-full oui-mix-blend-screen",
        props.className
      )}
    >
      {renderBackground()}
      <Flex
        direction="column"
        gapY={3}
        height="100%"
        px={3}
        pt={3}
        pb={3}
        className={cn(
          "oui-trading-leaderboard-mobile oui-overflow-y-auto oui-custom-scrollbar",
          "oui-relative oui-h-[calc(100vh_-_64px)]"
        )}
      >
        {props.showCampaigns && <CampaignsWidget />}
        <TradingListWidget className={cn(!props.canTrading && "oui-h-full")} />
        <div className="oui-fixed oui-left-0 oui-right-0 oui-bottom-0 oui-z-10">
          <BottomNavBarWidget />
        </div>
      </Flex>
    </div>
  );
};
