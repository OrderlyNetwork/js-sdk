import { FC, useMemo } from "react";
import { cn, useScreen } from "@orderly.network/ui";
import { CampaignsContentDesktopUI } from "./campaigns.content.desktop.ui";
import { useCampaignsScript } from "./campaigns.script";
import { CampaignsTimeDesktopUI } from "./components/time.desktop.ui";
import { CampaignsHeaderWidget } from "./header";

export type CampaignsWidgetProps = {
  className?: string;
  style?: React.CSSProperties;
};

export const CampaignsWidget: FC<CampaignsWidgetProps> = (props) => {
  const state = useCampaignsScript();
  const { isMobile } = useScreen();

  const contentClassNames = useMemo(() => {
    if (!isMobile) return undefined;
    return {
      container: "oui-h-[400px] oui-gap-5",
      time: "oui-text-sm oui-h-5",
      title: "oui-text-[24px] oui-leading-[32px]",
      description: "oui-text-2xs oui-leading-[15px]",
      topContainer: "oui-gap-1 oui-w-[284px]",
    };
  }, [isMobile]);

  return (
    <div
      className={cn(["oui-relative oui-z-[1] oui-overflow-hidden"])}
      style={props.style}
    >
      <CampaignsHeaderWidget
        backgroundSrc={state.backgroundSrc}
        campaigns={state.campaigns}
        currentCampaignId={state.currentCampaignId.toString()}
        onCampaignChange={state.onCampaignChange}
      />
      {state.currentCampaign && (
        <CampaignsContentDesktopUI
          campaign={state.currentCampaign}
          statistics={state.statistics}
          onLearnMore={state.onLearnMore}
          onTradeNow={state.onTradeNow}
          backgroundSrc={state.backgroundSrc}
          classNames={contentClassNames}
          isMobile={isMobile}
          isParticipated={state.isParticipated}
          shouldShowJoinButton={state.shouldShowJoinButton}
          joinCampaign={state.joinCampaign}
          isJoining={state.isJoining}
          joinError={state.joinError}
          canTrade={state.canTrade}
          accountStatus={state.accountStatus}
        />
      )}
      {state.currentCampaign && (
        <CampaignsTimeDesktopUI
          campaign={state.currentCampaign}
          isMobile={isMobile}
        />
      )}
    </div>
  );
};
