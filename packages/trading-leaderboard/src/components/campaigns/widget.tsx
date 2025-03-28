import { FC } from "react";
import { MobileCampaigns } from "./campaigns.mobile.ui";
import { useCampaignsScript } from "./campaigns.script";
import { Campaigns } from "./campaigns.ui";

export type CampaignsWidgetProps = {
  className?: string;
  style?: React.CSSProperties;
};

export const CampaignsWidget: FC<CampaignsWidgetProps> = (props) => {
  const state = useCampaignsScript();
  if (state.isMobile) {
    return <MobileCampaigns {...state} className={props.className} style={props.style} />;
  }
  return <Campaigns {...state} className={props.className} style={props.style} />;
};
