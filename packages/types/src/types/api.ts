import { OrderSide } from "../order";

export declare namespace API {
  //v1/public/token
  export interface Token {
    token: string;
    token_hash: string;
    decimals: number;
    minimum_withdraw_amount: number;
    chain_details: ChainDetail[];
  }

  //v1/public/token
  export interface ChainDetail {
    chain_id: string;
    contract_address: string;
    decimals: number;
  }

  // ws market, api v1/public/futures
  export interface MarketInfo {
    symbol: string;
    index_price: number;
    mark_price: number;
    sum_unitary_funding: number;
    est_funding_rate: number;
    last_funding_rate: number;
    next_funding_time: number;
    open_interest: string;
    "24h_open": number;
    "24h_close": number;
    "24h_high": number;
    "24h_low": number;
    "24h_volumn": number;
    "24h_amount": number;
  }

  export interface MarketInfoExt extends MarketInfo {
    change: number;
    "24h_volume": number;
  }

  /**
   * v1/public/info
   */
  export interface Symbol {
    symbol: string;
    quote_min: number;
    quote_max: number;
    quote_tick: number;
    base_min: number;
    base_max: number;
    base_tick: number;
    min_notional: number;
    price_range: number;
    price_scope: number;
    std_liquidation_fee: number;
    liquidator_fee: number;
    claim_insurance_fund_discount: number;
    funding_period: number;
    cap_funding: number;
    floor_funding: number;
    interest_rate: number;
    created_time: number;
    updated_time: number;
    imr_factor: number;
    base_mmr: number;
    base_imr: number;
  }

  export interface TokenItem {
    token: string;
    token_hash: string;
    decimals: number;
    minimum_withdraw_amount: number;
    chain_details: ChainDetail[];
  }

  export interface ChainDetail {
    chain_id: string;
    contract_address: string;
    decimals: number;
    withdrawal_fee: number;
  }

  export interface SymbolExt extends Symbol {
    base: string;
    base_dp: number;

    quote: string;
    quote_dp: number;
    type: string;
    name: string;
  }

  export interface Order {
    symbol: string;
    status: string;
    side: string;
    order_id: number;
    algo_order_id?: number;
    user_id: number;
    price: number | null;
    type: string;
    quantity: number;
    amount: null;
    visible: number;
    executed: number;
    total_fee: number;
    fee_asset: string;
    client_order_id: null;
    average_executed_price: number;
    created_time: number;
    updated_time: number;
    reduce_only: boolean;
    trigger_price?: number;
  }

  export interface OrderExt extends Order {
    mark_price: string;
  }

  export interface FundingRate {
    symbol: string;
    est_funding_rate: number;
    est_funding_rate_timestamp: number;
    last_funding_rate: number;
    last_funding_rate_timestamp: number;
    next_funding_time: number;
    sum_unitary_funding: number;
  }

  export interface PositionInfo {
    margin_ratio: number;
    initial_margin_ratio: number;
    maintenance_margin_ratio: number;
    open_margin_ratio: number;
    current_margin_ratio_with_orders: number;
    initial_margin_ratio_with_orders: number;
    maintenance_margin_ratio_with_orders: number;
    total_collateral_value: number;
    free_collateral: number;
    rows: Position[];
    total_pnl_24_h: number;
  }

  export interface Position {
    symbol: string;
    position_qty: number;
    cost_position: number;
    last_sum_unitary_funding: number;
    pending_long_qty: number;
    pending_short_qty: number;
    settle_price: number;
    average_open_price: number;
    unsettled_pnl: number;
    unsettled_pnl_ROI: number;
    mark_price: number;
    est_liq_price: number;
    timestamp: number;
    // Maintenance margin ratio
    mmr: number;
    imr: number;
    IMR_withdraw_orders: number;
    MMR_with_orders: number;
    pnl_24_h: number;
    fee_24_h: number;
  }

  export interface PositionExt extends Position {
    notional: number;
    mm: number;
  }

  export interface Trade {
    symbol: Symbol;
    side: OrderSide;
    ts: number;
    executed_price: number;
    executed_quantity: number;
    executed_timestamp: number;
  }

  export interface Holding {
    token: string;
    holding: number;
    frozen: number;
    pending_short: number;
    updated_time: number;
  }

  export interface AccountInfo {
    account_id: string;
    email: string;
    account_mode: string;
    tier: string;
    futures_tier: string;
    maintenance_cancel_orders: boolean;
    taker_fee_rate: number;
    maker_fee_rate: number;
    max_leverage: number;
    futures_taker_fee_rate: number;
    futures_maker_fee_rate: number;
    imr_factor: { [key: string]: number };
    max_notional: { [key: string]: number };
  }

  export interface Chain {
    dexs: string[];
    network_infos: NetworkInfos;
    token_infos: TokenInfo[];
    nativeToken?: TokenInfo;
    // nativeToken
  }

  export interface NetworkInfos {
    name: string;
    shortName: string;
    public_rpc_url: string;
    chain_id: number;
    currency_symbol: string;
    bridge_enable: boolean;
    mainnet: boolean;
    est_txn_mins: number | null;
    explorer_base_url: string;
    woofi_dex_cross_chain_router?: string;
    woofi_dex_depositor?: string;
    bridgeless?: boolean;
    withdrawal_fee?: number;
    minimum_withdraw_amount?: number;
  }

  export interface TokenInfo {
    address: string;
    symbol: string;
    decimals: number;
    swap_enable: boolean;
    woofi_dex_precision: number;
  }

  export interface Chain {
    token: string;
    token_hash: string;
    decimals: number;
    minimum_withdraw_amount: number;
    chain_details: ChainDetail[];
  }

  // export interface Token{

  // }

  export interface ChainDetail {
    chain_id: string;
    chain_name?: string;
    contract_address: string;
    decimals: number;
    withdrawal_fee: number;
  }
}

export declare namespace WSMessage {
  export interface Ticker {
    symbol: string;
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
    amount: number;
    count: number;
  }
  export interface MarkPrice {
    symbol: string;
    price: number;
  }

  export interface Position {
    symbol: string;
    positionQty: number;
    costPosition: number;
    lastSumUnitaryFunding: number;
    sumUnitaryFundingVersion: number;
    pendingLongQty: number;
    pendingShortQty: number;
    settlePrice: number;
    averageOpenPrice: number;
    unsettledPnl: number;
    pnl24H: number;
    fee24H: number;
    markPrice: number;
    estLiqPrice: number;
    version: number;
    imr: number;
    imrwithOrders: number;
    mmrwithOrders: number;
    mmr: number;
  }

  export interface VaultBalance {
    chain_id: string;
    token: string;
    balance: number;
  }
}
