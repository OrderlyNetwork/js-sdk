import { useMemo } from "react";
import { useQuery, useConfig } from "@orderly.network/hooks";
import { useTradingLeaderboardContext } from "../provider";
import { CampaignStatsDetailsResponse } from "./type";

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
    backgroundSrc,
  } = useTradingLeaderboardContext();

  const symbols = Array.isArray(currentCampaign?.volume_scope)
    ? currentCampaign?.volume_scope.join(",")
    : currentCampaign?.volume_scope;

  const brokerId = useConfig("brokerId");

  const isCampaignStarted = useMemo(() => {
    return (
      currentCampaign?.start_time &&
      currentCampaign?.start_time < new Date().toISOString()
    );
  }, [currentCampaign]);

  const searchParams = useMemo(() => {
    return {
      campaign_id: currentCampaignId,
      symbols: symbols || "",
      broker_id: brokerId,
      group_by: "BROKER",
    };
  }, [currentCampaignId, symbols, brokerId]);

  const { data } = useQuery<CampaignStatsDetailsResponse>(
    isCampaignStarted && currentCampaignId !== "general"
      ? `https://api.orderly.org/v1/public/campaign/stats/details?${new URLSearchParams(searchParams).toString()}`
      : null,
  );

  const statistics = {
    total_participants: data?.[0]?.user_count,
    total_volume: data?.[0]?.volume,
  };

  const onLearnMore = () => {
    if (currentCampaign?.rule_url) {
      window.open(currentCampaign.rule_url, "_blank");
    }
  };

  const onTradeNow = () => {
    if (currentCampaign?.trading_url) {
      window.open(currentCampaign.trading_url, "_self");
    }
  };

  return {
    campaigns,
    currentCampaignId,
    currentCampaign,
    onCampaignChange,
    statistics,
    userData,
    onLearnMore,
    onTradeNow,
    backgroundSrc,
  };
};
