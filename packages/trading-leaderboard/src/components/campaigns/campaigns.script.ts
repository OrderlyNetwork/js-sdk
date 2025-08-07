import { useMemo, useCallback } from "react";
import {
  useQuery,
  useConfig,
  useMutation,
  useAccount,
} from "@orderly.network/hooks";
import { AccountStatusEnum } from "@orderly.network/types";
import { toast } from "@orderly.network/ui";
import { useTradingLeaderboardContext } from "../provider";
import {
  CampaignStatsDetailsResponse,
  CampaignStatsResponse,
  UserCampaignsResponse,
} from "./type";

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

  const isCampaignEnded = useMemo(() => {
    return (
      currentCampaign?.end_time &&
      currentCampaign?.end_time < new Date().toISOString()
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

  const { data: stats } = useQuery<CampaignStatsResponse>(
    currentCampaignId !== "general"
      ? `https://api.orderly.org/v1/public/campaign/stats?${new URLSearchParams(searchParams).toString()}`
      : null,
  );

  const { state } = useAccount();

  const { data: userCampaigns, mutate: refreshUserCampaigns } =
    useQuery<UserCampaignsResponse>(
      currentCampaignId !== "general" && state.address
        ? `https://api.orderly.org/v1/public/campaigns?address=${state.address}`
        : null,
    );

  const isParticipated = useMemo(() => {
    const target = userCampaigns?.find((item) => item.id == currentCampaignId);
    return !!target;
  }, [userCampaigns, currentCampaignId]);

  const shouldShowJoinButton = useMemo(() => {
    // return false;
    return !!state.address && !isCampaignEnded && !isParticipated;
  }, [state.address, isCampaignEnded, isParticipated]);

  const [doJoinCampaign, { isMutating: isJoining, error: joinError }] =
    useMutation(`/v1/client/campaign/sign_up`, "POST");

  const joinCampaign = useCallback(
    async (data: { campaign_id: string | number }) => {
      try {
        if (state.status < AccountStatusEnum.EnableTrading) {
          toast.error("Please complete your account sign-up to join.");
          return;
        }
        // console.log("data", data);
        const result = await doJoinCampaign(data);
        // console.log("result", result);

        if (result?.success !== false) {
          // Refresh user campaigns data to update participation status
          await refreshUserCampaigns();
          toast.success(result?.message || "Campaign joined successfully");
          return result;
        } else {
          toast.error(result?.message || "Failed to join campaign");
        }
      } catch (error) {
        console.error("Failed to join campaign:", error);
        throw error;
      }
    },
    [doJoinCampaign, refreshUserCampaigns, state.status],
  );

  const statistics = {
    total_participants: stats?.user_count,
    total_volume: stats?.volume,
  };

  const onLearnMore = () => {
    if (currentCampaign?.rule_url) {
      if (currentCampaign.rule_config?.action === "scroll") {
        document
          .getElementById(currentCampaign.rule_url)
          ?.scrollIntoView({ behavior: "smooth" });
      } else {
        window.open(currentCampaign.rule_url, "_blank");
      }
    }
  };

  const onTradeNow = () => {
    if (currentCampaign?.trading_url) {
      window.open(currentCampaign.trading_url, "_self");
    }
  };

  const canTrade = useMemo(() => {
    if (!currentCampaign) return false;
    return (
      currentCampaign?.start_time < new Date().toISOString() &&
      currentCampaign?.end_time > new Date().toISOString() &&
      state.status >= AccountStatusEnum.EnableTrading
    );
  }, [currentCampaign, state.status]);

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
    joinCampaign,
    isJoining,
    isParticipated,
    shouldShowJoinButton,
    joinError,
    canTrade,
  };
};
