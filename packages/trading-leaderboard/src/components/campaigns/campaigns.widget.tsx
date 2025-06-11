import { FC } from "react";
import { cn, useScreen } from "@orderly.network/ui";
import { CampaignsHeaderUI } from "./campaigins.header.ui";
import { CampaignsContentDesktopUI } from "./campaigns.content.desktop.ui";
import { useCampaignsScript } from "./campaigns.script";
import { CampaignsTimeDesktopUI } from "./components/time.desktop.ui";

export type CampaignsWidgetProps = {
  className?: string;
  style?: React.CSSProperties;
};

export const CampaignsWidget: FC<CampaignsWidgetProps> = (props) => {
  const state = useCampaignsScript();
  const { isMobile } = useScreen();

  //   if (isMobile) {
  //     return (
  //       <MobileCampaigns
  //         {...state}
  //         className={props.className}
  //         style={props.style}
  //       />
  //     );
  //   }

  return (
    <div
      className={cn(["oui-overflow-hidden"], props.className)}
      style={props.style}
    >
      <CampaignsHeaderUI
        backgroundSrc={state.backgroundSrc}
        campaigns={state.campaigns}
        currentCampaignId={state.currentCampaignId}
        onCampaignChange={state.onCampaignChange}
      />
      <CampaignsContentDesktopUI
        campaign={state.currentCampaign}
        statistics={state.statistics}
        onLearnMore={state.onLearnMore}
        onTradeNow={state.onTradeNow}
        backgroundSrc={state.backgroundSrc}
      />
      {state.currentCampaign && (
        <CampaignsTimeDesktopUI campaign={state.currentCampaign} />
      )}
    </div>
  );
};
