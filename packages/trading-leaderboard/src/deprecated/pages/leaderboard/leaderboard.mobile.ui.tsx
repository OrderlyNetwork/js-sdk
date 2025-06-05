import { FC } from "react";
import { cn, Flex } from "@orderly.network/ui";
import { DeprecatedCampaignsWidget } from "../../components/campaigns";
import { DeprecatedTradingListWidget } from "../../components/tradingList";
import { LeaderboardScriptReturn } from "./leaderboard.script";

export type LeaderboardProps = {
  style?: React.CSSProperties;
  className?: string;
} & LeaderboardScriptReturn;

export const MobileLeaderboardWidget: FC<LeaderboardProps> = (props) => {
  // const renderBackground = () => {
  //   const linearGradient =
  //     "linear-gradient(180deg, rgba(var(--oui-color-base-10) / 0.3) 0%, rgba(var(--oui-color-base-10) / 0) 70%, rgba(var(--oui-color-base-10) / 1) 100%)";

  //   if (props.isVideo) {
  //     return (
  //       <div
  //         className={cn("oui-absolute oui-left-0 oui-top-0", "oui-size-full")}
  //       >
  //         <div
  //           style={{
  //             backgroundImage: linearGradient,
  //             backgroundSize: "cover",
  //             backgroundRepeat: "no-repeat",
  //           }}
  //           className={cn("oui-absolute oui-left-0 oui-top-0", "oui-size-full")}
  //         />
  //         <video
  //           playsInline
  //           // eslint-disable-next-line react/no-unknown-property
  //           webkit-playsinline // need to use this prop to ban full screen in iphone
  //           autoPlay
  //           loop
  //           muted
  //           className={cn(
  //             // rest style
  //             "oui-pointer-events-none oui-border-none oui-bg-transparent oui-outline-none",
  //             "oui-size-full",
  //             // "oui-absolute oui-top-0 oui-left-0",
  //             "oui-object-cover",
  //             "oui-opacity-50",
  //           )}
  //           // ref={(video) => {
  //           //   if (video) {
  //           //     video.setAttribute("playsinline", "true");
  //           //     video.setAttribute("webkit-playsinline", "true");
  //           //   }
  //           // }}
  //         >
  //           <source src={props.backgroundSrc} type="video/mp4" />
  //           <source src={props.backgroundSrc} type="video/webm" />
  //           <source src={props.backgroundSrc} type="video/ogg" />
  //           <source src={props.backgroundSrc} type="video/avi" />
  //           Your browser does not support the video tag.
  //         </video>
  //       </div>
  //     );
  //   }

  //   if (props.backgroundSrc) {
  //     return (
  //       <div
  //         style={{
  //           backgroundImage: `${linearGradient}, url(${props.backgroundSrc}) `,
  //           backgroundSize: "cover",
  //           backgroundRepeat: "no-repeat",
  //         }}
  //         className={cn(
  //           "oui-absolute oui-left-0 oui-top-0",
  //           "oui-size-full",
  //           "oui-opacity-50",
  //         )}
  //       />
  //     );
  //   }
  // };
  return (
    <div
      style={{
        paddingBottom: "calc(64px + env(safe-area-inset-bottom))",
      }}
      className={cn(
        "oui-relative oui-grid oui-h-[calc(100vh-44px)] oui-gap-1 oui-bg-base-10",
        "oui-mix-blend-screen",
        props.className,
      )}
    >
      {/* {renderBackground()} */}
      <Flex
        direction="column"
        gapY={3}
        height="100%"
        px={3}
        pt={3}
        pb={3}
        className={cn(
          "oui-trading-leaderboard-mobile oui-custom-scrollbar oui-overflow-y-auto",
          "oui-relative oui-h-[calc(100vh_-_64px)]",
        )}
      >
        {props.showCampaigns && <DeprecatedCampaignsWidget />}
        <DeprecatedTradingListWidget />
      </Flex>
    </div>
  );
};
