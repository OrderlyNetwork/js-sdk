import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { generatePath } from "@kodiak-finance/orderly-i18n";
import { LeaderboardPage } from "@kodiak-finance/orderly-trading-leaderboard";
import { getCampaigns } from "../../../stories/package/trading-leaderboard/tradingLeaderboard.stories";
import { BaseLayout } from "../../components/layout/baseLayout";
import { PathEnum } from "../../constant";

const leaderboardCampaigns = getCampaigns();

export default function Leaderboard() {
  const [campaignId, setCampaignId] = useState<string | undefined>("116");
  const { search } = useLocation();

  useEffect(() => {
    const campaign_id = new URLSearchParams(search).get("campaign_id");
    const campaign = leaderboardCampaigns.find(
      (campaign) => campaign.campaign_id === String(campaign_id),
    );
    if (campaign_id && campaign) {
      setCampaignId(campaign_id);
    } else {
      const now = new Date().toISOString();
      const campaign = leaderboardCampaigns.find(
        (campaign) => campaign.start_time < now && campaign.end_time > now,
      );
      if (campaign) {
        setCampaignId(campaign.campaign_id as string);
      }
    }
  }, [search]);

  return (
    <div className="orderly-sdk-layout">
      <BaseLayout initialMenu={PathEnum.Leaderboard}>
        <LeaderboardPage
          campaigns={leaderboardCampaigns}
          className="oui-py-5"
          campaignId={campaignId}
          onCampaignChange={setCampaignId as any}
          href={{
            trading: generatePath({ path: `${PathEnum.Leaderboard}` }),
          }}
          backgroundSrc="/leaderboard/background.jpg"
        />
      </BaseLayout>
    </div>
  );
}
