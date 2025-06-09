import { FC } from "react";
import { CampaignConfig } from "../type";
import { CampaignsAxis, TimelinePoint } from "./axis";
import { CampaignsCountdown } from "./countdown";

const timelineData: TimelinePoint[] = [
  {
    title: "Battle starts",
    type: "past",
    time: "2023-12-13 12:00 UTC",
  },
  {
    title: "Battle ends",
    type: "active",
    time: "2023-12-13 12:00 UTC",
  },
  {
    title: "Reward distribution",
    type: "future",
    time: "2023-12-13 12:00 UTC",
  },
];

export const CampaignsTimeDesktopUI: FC<{ campaign: CampaignConfig }> = ({
  campaign,
}) => {
  return (
    <div className="oui-w-full oui-py-10 oui-flex oui-flex-col oui-items-center oui-gap-4">
      <CampaignsCountdown campaign={campaign} />
      <CampaignsAxis points={timelineData} />
    </div>
  );
};
