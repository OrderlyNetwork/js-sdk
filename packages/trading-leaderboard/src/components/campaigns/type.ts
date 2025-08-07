export enum CampaignTagEnum {
  ONGOING = "ongoing",
  COMING = "coming",
  ENDED = "ended",
  EXCLUSIVE = "exclusive",
}

// Campaign statistics data structure (from campaign statistics API)
export interface CampaignStatistics {
  total_participants?: number;
  total_volume?: number;
}

// Campaign prize pool configuration types
export interface PrizePoolTier {
  position?: number;
  position_range?: [number, number];
  amount: number;
}

export interface PrizePool {
  pool_id: string;
  label: string;
  total_prize: number;
  currency: string;
  metric: "volume" | "pnl";
  tiers: PrizePoolTier[];
}

// Ticket prize configuration types
export interface TicketTierRule {
  value: number;
  tickets: number;
}

export interface TicketLinearRule {
  every: number;
  tickets: number;
}

export interface TicketRules {
  total_prize: number;
  currency: string;
  metric: "volume" | "pnl";
  mode: "tiered" | "linear";
  tiers?: TicketTierRule[];
  linear?: TicketLinearRule;
}

// Campaign configuration
export interface CampaignConfig {
  campaign_id: number | string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  reward_distribution_time?: string;
  volume_scope?: string | string[];
  referral_codes?: string[] | string;
  prize_pools?: PrizePool[];
  ticket_rules?: TicketRules;
  image?: string;
  rule_url?: string;
  rule_config?: {
    action?: "scroll" | "click";
  };
  trading_url?: string;
  trading_config?: {
    format?: string;
  };
  href?: string;
  hide_arena?: boolean;
  hide_rewards?: boolean;
  highlight_pool_id?: string;
}

// User data for calculations
export interface UserData {
  rank?: number | string;
  pnl: number;
  total_participants?: number;
  volume: number;
  referral_code?: string;
}

export type CampaignStatsDetailsResponse = {
  broker_id: string;
  user_count: number;
  volume: number;
  symbol: string;
}[];

export type CampaignStatsResponse = {
  sign_up_count: number;
  user_count: number;
  volume: number;
  updated_time: number;
};

export type UserCampaignsResponse = {
  id: string;
  register_time: number;
}[];
