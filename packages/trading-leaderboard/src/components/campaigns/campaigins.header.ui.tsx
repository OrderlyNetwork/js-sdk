import { FC } from "react";
import { DefaultCampaign } from "./DefaultCampaign";
import { CampaignItemUI } from "./campaign.item.ui";
import { CampaignConfig } from "./type";
import { getCampaignTag } from "./utils";

export const CampaignsHeaderUI: FC<{
  campaigns: CampaignConfig[];
  currentCampaignId: string;
  onCampaignChange: (campaignId: string) => void;
}> = ({ campaigns, currentCampaignId, onCampaignChange }) => {
  return (
    <div className="oui-flex oui-gap-2 oui-w-full oui-overflow-x-scroll">
      <DefaultCampaign
        currentCampaignId={currentCampaignId}
        onCampaignChange={onCampaignChange}
      />
      {campaigns?.map((campaign) => (
        <CampaignItemUI
          campaign={campaign}
          key={campaign.campaign_id}
          tag={getCampaignTag(campaign)}
          active={currentCampaignId === campaign.campaign_id}
          onCampaignChange={onCampaignChange}
        />
      ))}
    </div>
  );
};
