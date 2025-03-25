import { FC } from "react";
import { cn, Flex } from "@orderly.network/ui";
import { TradingListWidget } from "../../components/tradingList/widget";
import { CampaignsWidget } from "../../components/campaigns";
import { LeaderboardScriptReturn } from "./leaderboard.script";

export type LeaderboardProps = {
  className?: string;
} & LeaderboardScriptReturn;

export const Leaderboard: FC<LeaderboardProps> = (props) => {
  const renderBackground = () => {
    // if (props.isVideo) {
    //   return (
    //     <video
    //       autoPlay
    //       loop
    //       muted
    //       className={cn(
    //         "oui-absolute oui-top-0 oui-left-0 oui-w-full oui-h-full oui-object-cover oui-z-[-1]"
    //       )}
    //     >
    //       <source src={props.backgroundSrc} type="video/mp4" />
    //       Your browser does not support the video tag.
    //     </video>
    //   );
    // }

    if (props.backgroundSrc) {
      return (
        <div
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(7, 8, 10, 0.3) 0%, rgba(7, 8, 10, 0) 70%, #07080A 100%), url(${props.backgroundSrc}) `,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
          className={cn(
            "oui-w-full oui-h-full",
            "oui-absolute oui-top-[-30%] oui-left-0",
            "oui-opacity-50"
          )}
        />
      );
    }
  };

  return (
    <div className={cn("oui-relative oui-h-full", props.className)}>
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
