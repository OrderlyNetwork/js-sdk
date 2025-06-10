import { useTradingLeaderboardContext } from "../provider";
import { CampaignStatistics } from "./type";

// Mock function to simulate API call for campaign statistics
// In real implementation, this would be replaced with actual API hook
const mockCampaignStatistics: CampaignStatistics = {
  total_participants: 10000,
  total_volume: 323232,
  total_pnl: 125000,
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
  } = useTradingLeaderboardContext();

  // TODO: Replace with actual API hook like useQuery for campaign statistics
  // const { data: statistics } = useQuery(`/v1/public/campaign/statistics?campaign_id=${currentCampaignId}`)
  const statistics = mockCampaignStatistics;

  return {
    campaigns,
    currentCampaignId,
    currentCampaign,
    onCampaignChange,
    statistics,
  };
};
