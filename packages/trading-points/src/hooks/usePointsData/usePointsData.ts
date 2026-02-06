import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";
import {
  useQuery,
  usePrivateQuery,
  useConfig,
  RefferalAPI,
  noCacheConfig,
} from "@orderly.network/hooks";
import { commify, numberToHumanStyle } from "@orderly.network/utils";
import {
  StagesResponse,
  UserStatistics,
  StageInfo,
  PointsTimeRange,
} from "./types";

export interface PointsDisplay {
  currentPointsDisplay: string;
  tradingPointsDisplay: string;
  pnlPointsDisplay: string;
  referralPointsDisplay: string;
  rankingDisplay: string;
}

export interface UsePointsDataReturn {
  stages: StagesResponse | undefined;
  userStatistics: UserStatistics | undefined;
  isCurrentStagePending?: boolean;
  isCurrentStageCompleted?: boolean;
  currentStage: StageInfo | undefined;
  setCurrentStage: (stage: StageInfo) => void;
  isLoading: boolean;
  isStagesLoading: boolean;
  isUserStatisticsLoading: boolean;
  isNoCampaign: boolean;
  refLink: string;
  refCode: string;
  selectedTimeRange: PointsTimeRange;
  setSelectedTimeRange: Dispatch<SetStateAction<PointsTimeRange>>;
  getRankingUrl: (args: {
    page: number;
    pageSize: number;
    timeRange?: string;
  }) => string | null;
  brokerId?: string | number;
  pointsDisplay: PointsDisplay;
  allTimePointsDisplay: PointsDisplay;
}

export function usePointsData(): UsePointsDataReturn {
  const brokerId = useConfig("brokerId");
  const [currentStage, setCurrentStage] = useState<StageInfo | undefined>(
    undefined,
  );
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<PointsTimeRange>("this_week");

  const { data: stages, isLoading: isStagesLoading } = useQuery<StagesResponse>(
    brokerId ? `/v1/public/points/stages?broker_id=${brokerId}` : null,
    {
      formatter: (res) => {
        if (res?.rows) {
          // Sort by epoch_period in descending order (smaller numbers at end)
          res.rows.sort(
            (a: StageInfo, b: StageInfo) => b.epoch_period - a.epoch_period,
          );
        }
        return res;
      },
      revalidateOnFocus: false,
    },
  );

  useEffect(() => {
    if (
      !stages?.rows ||
      stages.rows.length === 0 ||
      currentStage !== undefined
    ) {
      return;
    }

    // Priority: active > pending > completed > first
    let selectedStage = stages.rows[0]; // Default to first

    const activeStage = stages.rows.find((stage) => stage.status === "active");
    if (activeStage) {
      selectedStage = activeStage;
    } else {
      const pendingStage = [...stages.rows]
        .reverse()
        .find((stage) => stage.status === "pending");
      if (pendingStage) {
        selectedStage = pendingStage;
      } else {
        const completedStage = stages.rows.find(
          (stage) => stage.status === "completed",
        );
        if (completedStage) {
          selectedStage = completedStage;
        }
      }
    }

    setCurrentStage(selectedStage);
  }, [stages, currentStage]);

  const { data: userStatistics, isLoading: isUserStatisticsLoading } =
    usePrivateQuery<UserStatistics>(
      currentStage !== undefined
        ? `/v1/client/points/user_statistics?stage=${currentStage.stage_id}`
        : null,
      {
        formatter: (res) => res,
        revalidateOnFocus: false,
      },
    );

  const { data: referralInfo } = usePrivateQuery<RefferalAPI.ReferralInfo>(
    "/v1/referral/info",
    {
      revalidateOnFocus: true,
      errorRetryCount: 3,
      ...noCacheConfig,
    },
  );

  const firstCode = useMemo(() => {
    const codes = referralInfo?.referrer_info?.referral_codes;
    if (!codes || codes.length === 0) {
      return undefined;
    }
    return codes[0];
  }, [referralInfo?.referrer_info?.referral_codes]);

  const refCode = useMemo(() => {
    return firstCode?.code || "--";
  }, [firstCode]);

  const refLink = useMemo(() => {
    if (!firstCode || !firstCode.code) {
      return "--";
    }
    const referralLinkUrl = window.location.origin;
    return `${referralLinkUrl}?ref=${firstCode.code}`;
  }, [firstCode]);

  const getRankingUrl = useCallback(
    (args: { page: number; pageSize: number; timeRange?: string }) => {
      if (!currentStage || !brokerId) return null;
      const searchParams = new URLSearchParams();
      searchParams.set("page", args.page.toString());
      searchParams.set("size", args.pageSize.toString());
      searchParams.set("stage", String(currentStage.stage_id));
      searchParams.set("period", args.timeRange || selectedTimeRange);
      searchParams.set("broker_id", String(brokerId));
      return `/v1/public/points/rankings?${searchParams.toString()}`;
    },
    [brokerId, currentStage, selectedTimeRange],
  );

  const isLoading = isStagesLoading || isUserStatisticsLoading;

  const isNoCampaign =
    !isStagesLoading && (!stages?.rows || stages.rows.length === 0);

  const formatPoints = (value?: number | null) => {
    if (value === undefined || value === null) {
      return "--";
    }
    return numberToHumanStyle(value, 2);
  };

  const calculateTotalPoints = useCallback(
    (
      breakdown:
        | {
            trading_point: number;
            pnl_point: number;
            referral_point: number;
          }
        | undefined,
    ) => {
      if (!breakdown) return undefined;
      return (
        breakdown.trading_point + breakdown.pnl_point + breakdown.referral_point
      );
    },
    [],
  );

  const pointsDisplay = useMemo<PointsDisplay>(() => {
    if (!userStatistics) {
      return {
        currentPointsDisplay: "--",
        tradingPointsDisplay: "--",
        pnlPointsDisplay: "--",
        referralPointsDisplay: "--",
        rankingDisplay: "--",
      };
    }

    const breakdownThisWeek = userStatistics.weekly_breakdown?.this_week;
    const breakdownLastWeek = userStatistics.weekly_breakdown?.last_week;

    let selectedBreakdown;
    let ranking;

    if (selectedTimeRange === "all_time") {
      // For all_time, use the top-level stats
      selectedBreakdown = {
        trading_point: userStatistics.trading_point,
        pnl_point: userStatistics.pnl_point,
        referral_point: userStatistics.referral_point,
      };
      ranking = userStatistics.stage_rank;
    } else if (selectedTimeRange === "this_week") {
      selectedBreakdown = breakdownThisWeek;
      ranking = breakdownThisWeek?.rank;
    } else {
      // last_week
      selectedBreakdown = breakdownLastWeek;
      ranking = breakdownLastWeek?.rank;
    }

    const currentPoints = calculateTotalPoints(selectedBreakdown) ?? 0;

    return {
      currentPointsDisplay: formatPoints(currentPoints),
      tradingPointsDisplay: formatPoints(selectedBreakdown?.trading_point),
      pnlPointsDisplay: formatPoints(selectedBreakdown?.pnl_point),
      referralPointsDisplay: formatPoints(selectedBreakdown?.referral_point),
      rankingDisplay:
        ranking === null || ranking === undefined ? "--" : commify(ranking),
    };
  }, [userStatistics, selectedTimeRange, calculateTotalPoints]);

  // Compute display values for all_time (for intro page)
  const allTimePointsDisplay = useMemo<PointsDisplay>(() => {
    if (!userStatistics) {
      return {
        currentPointsDisplay: "--",
        tradingPointsDisplay: "--",
        pnlPointsDisplay: "--",
        referralPointsDisplay: "--",
        rankingDisplay: "--",
      };
    }

    const currentPoints =
      calculateTotalPoints({
        trading_point: userStatistics.trading_point,
        pnl_point: userStatistics.pnl_point,
        referral_point: userStatistics.referral_point,
      }) ?? 0;

    return {
      currentPointsDisplay: formatPoints(currentPoints),
      tradingPointsDisplay: formatPoints(userStatistics.trading_point),
      pnlPointsDisplay: formatPoints(userStatistics.pnl_point),
      referralPointsDisplay: formatPoints(userStatistics.referral_point),
      rankingDisplay:
        userStatistics.stage_rank === null ||
        userStatistics.stage_rank === undefined
          ? "--"
          : commify(userStatistics.stage_rank),
    };
  }, [userStatistics, calculateTotalPoints]);

  return {
    stages,
    userStatistics,
    currentStage,
    setCurrentStage,
    isLoading,
    isStagesLoading,
    isUserStatisticsLoading,
    isNoCampaign,
    refLink,
    refCode,
    selectedTimeRange,
    setSelectedTimeRange,
    getRankingUrl,
    brokerId,
    pointsDisplay,
    allTimePointsDisplay,
    isCurrentStagePending: currentStage?.status === "pending",
    isCurrentStageCompleted: currentStage?.status === "completed",
  };
}
