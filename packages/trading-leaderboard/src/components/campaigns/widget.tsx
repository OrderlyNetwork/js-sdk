import { useCampaignsScript } from "./campaigns.script";
import { Campaigns } from "./campaigns.ui";

export const CampaignsWidget = () => {
  const state = useCampaignsScript();
  return <Campaigns {...state} />;
};
