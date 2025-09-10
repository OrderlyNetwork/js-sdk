export interface VaultSupportedChain {
  chain_id: string;
  chain_name: string;
}

export type VaultTimeRange = "24h" | "7d" | "30d" | "all_time";

export interface VaultInfo {
  vault_id: string;
  vault_address: string;
  vault_type: string;
  performance_fee_rate: number;
  supported_chains: VaultSupportedChain[];
  tvl: number;
  apr30_d: number;
  vault_lifetime_net_pnl: number;
  lp_counts: number;
  total_main_shares: number;
  est_main_share_price: number;
  gate_threshold_pct: number;
  gate_triggered: boolean;
  lock_duration: number;
  broker_id: string;
  "30d_apr": number;
  "30d_apy": number;
}

export interface VaultLpPerformance {
  time_range: VaultTimeRange;
  tvl_max_drawdown: number;
  incremental_net_pnl: number;
  pnl_max_drawdown: number;
}

export interface VaultLpInfo {
  vault_id: string;
  lp_nav: number;
  lp_tvl: number;
  total_main_shares: number;
  available_main_shares: number;
  potential_pnl: number;
}

export interface VaultOperation {
  type: OperationType;
  vault_id: string;
  amount_change: number;
  created_time: string;
  status: string;
}

export enum RoleType {
  LP = "lp",
  SP = "sp",
}

export enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAWAL = "withdrawal",
}

export type VaultsPageConfig = {
  headerImage?: React.ReactNode;
};
