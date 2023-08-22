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

  export interface SymbolExt extends Symbol {
    base: string;
    quote: string;
    type: string;
  }

  export interface Order {
    symbol: string;
    status: string;
    side: string;
    order_id: number;
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
    mark_price: number;
    est_liq_price: number;
    timestamp: number;
    mmr: number;
    imr: number;
    IMR_withdraw_orders: number;
    MMR_with_orders: number;
    pnl_24_h: number;
    fee_24_h: number;
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
}
