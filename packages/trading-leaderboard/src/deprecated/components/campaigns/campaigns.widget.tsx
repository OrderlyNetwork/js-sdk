import { FC } from "react";
import { useScreen } from "@veltodefi/ui";
import { MobileCampaigns } from "./campaigns.mobile.ui";
import { useCampaignsScript } from "./campaigns.script";
import { Campaigns } from "./campaigns.ui";

export type CampaignsWidgetProps = {
  className?: string;
  style?: React.CSSProperties;
};

export const CampaignsWidget: FC<CampaignsWidgetProps> = (props) => {
  const state = useCampaignsScript();
  const { isMobile } = useScreen();

  if (isMobile) {
    return (
      <MobileCampaigns
        {...state}
        className={props.className}
        style={props.style}
      />
    );
  }
  return (
    <Campaigns {...state} className={props.className} style={props.style} />
  );
};
