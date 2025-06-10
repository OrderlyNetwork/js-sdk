import { FC } from "react";
import { CampaignConfig } from "../type";
import { generateCampaignTimeline } from "../utils";
import { CampaignsAxis, TimelinePoint } from "./axis";
import { CampaignsCountdown } from "./countdown";

export const CampaignsTimeDesktopUI: FC<{ campaign: CampaignConfig }> = ({
  campaign,
}) => {
  const timelineData = generateCampaignTimeline(campaign);

  return (
    <div className="oui-w-full oui-py-10 oui-flex oui-flex-col oui-items-center oui-gap-4">
      <CampaignsCountdown campaign={campaign} />
      <CampaignsAxis points={timelineData} />
    </div>
  );
};
