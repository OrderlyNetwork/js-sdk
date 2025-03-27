import { FC } from "react";
import { cn, Flex } from "@orderly.network/ui";
import { TradingListWidget } from "../../components/tradingList/widget";
import { CampaignsWidget } from "../../components/campaigns";
import { LeaderboardScriptReturn } from "./leaderboard.script";

export type LeaderboardProps = {
  style?: React.CSSProperties;
  className?: string;
} & LeaderboardScriptReturn;

export const Leaderboard: FC<LeaderboardProps> = (props) => {
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
            autoPlay
            loop
            muted
            className={cn(
              // rest style
              "oui-border-none oui-outline-none oui-bg-transparent",
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
      style={props.style}
      className={cn(
        "oui-relative oui-h-full oui-mix-blend-screen",
        props.className
      )}
    >
      {renderBackground()}
      <Flex
        direction="column"
        gapY={5}
        height="100%"
        className={cn(
          "oui-trading-leaderboard oui-relative",
          "oui-max-w-[1040px] oui-mx-auto"
        )}
      >
        <CampaignsWidget />
        <TradingListWidget className="oui-h-[calc(100%_-_280px_-_20px)]" />
      </Flex>
    </div>
  );
};
