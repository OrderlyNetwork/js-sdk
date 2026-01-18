export interface StageInfo {
  stage_id: number;
  start_time: number;
  epoch_period: number;
  end_time: number | null;
  status: "active" | "completed" | "pending";
  stage_name: string;
  stage_description: string;
  is_continous: boolean;
}

export interface StagesResponse {
  rows: StageInfo[];
}

export interface WeeklyBreakdown {
  trading_point: number;
  pnl_point: number;
  referral_point: number;
  rank: number;
}

export type PointsTimeRange = "all_time" | "last_week" | "this_week";

export interface UserStatistics {
  stage: number;
  address: string;
  trading_point: number;
  pnl_point: number;
  referral_point: number;
  stage_rank: number;
  stage_points: number;
  l1_referral_boost: number | null;
  l2_referral_boost: number | null;
  weekly_breakdown: {
    this_week: WeeklyBreakdown;
    last_week: WeeklyBreakdown;
  };
}
