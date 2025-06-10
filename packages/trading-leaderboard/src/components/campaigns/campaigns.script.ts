import { useQuery } from "@orderly.network/hooks";
import { useTradingLeaderboardContext } from "../provider";
import { CampaignStatistics, CampaignStatsDetailsResponse } from "./type";

// Mock function to simulate API call for campaign statistics
// In real implementation, this would be replaced with actual API hook
const mockCampaignStatistics: CampaignStatistics = {
  total_participants: 10000,
  total_volume: 323232,
};

/**
 * Hook for managing campaigns data and statistics
 * TODO: Replace mock data with real API calls when backend is ready
 */
export const useCampaignsScript = () => {
  const {
    campaigns = [],
    currentCampaignId,
    onCampaignChange,
    currentCampaign,
    userData,
  } = useTradingLeaderboardContext();

  // TODO: Replace with actual API hook like useQuery for campaign statistics
  // const { data: statistics } = useQuery(`/v1/public/campaign/statistics?campaign_id=${currentCampaignId}`)
  const { data } = useQuery<CampaignStatsDetailsResponse>(
    currentCampaignId === "general"
      ? null
      : `https://api.orderly.org/v1/public/campaign/stats/details?campaign_id=${currentCampaignId}&symbols=PERP_WIF_USDC`,
  );

  const statistics = {
    total_participants: data?.[0]?.user_count,
    total_volume: data?.[0]?.volume,
  };

  return {
    campaigns,
    currentCampaignId,
    currentCampaign,
    onCampaignChange,
    statistics,
    userData,
  };
};
