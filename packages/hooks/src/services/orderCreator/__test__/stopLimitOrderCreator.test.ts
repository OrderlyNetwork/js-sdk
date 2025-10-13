import { OrderEntity } from "@kodiak-finance/orderly-types";
import { StopLimitOrderCreator } from "../stopLimitOrderCreator";

describe("StopLimitOrderCreator", () => {
  let orderCreator: StopLimitOrderCreator;

  beforeEach(() => {
    orderCreator = new StopLimitOrderCreator();
  });

  it("should create a stop limit order", () => {
    const values = {
      reduce_only: false,
      side: "BUY",
      order_type: "STOP_LIMIT",
      isStopOrder: false,
      symbol: "PERP_ETH_USDC",
      visible_quantity: 1,
      order_price: "4024.21",
      order_quantity: "0.2294",
      trigger_price: "4010.96",
      total: "982.63",
    } as OrderEntity;
    const config = {
      symbol: {
        symbol: "PERP_ETH_USDC",
        quote_min: 0,
        quote_max: 100000,
        quote_tick: 0.01,
        base_min: 0.0001,
        base_max: 320,
        base_tick: 0.0001,
        min_notional: 10,
        price_range: 0.03,
        price_scope: 0.4,
        std_liquidation_fee: 0.025,
        liquidator_fee: 0.0125,
        claim_insurance_fund_discount: 0.0075,
        funding_period: 8,
        cap_funding: 0.00375,
        floor_funding: -0.00375,
        interest_rate: 0.0001,
        created_time: 1693820915671,
        updated_time: 1709888598319,
        liquidation_tier: 1,
        base_mmr: 0.025,
        base_imr: 0.05,
        base_dp: 4,
        quote_dp: 2,
        base: "ETH",
        quote: "USDC",
        type: "PERP",
        name: "ETH-PERP",
      },
      maxQty: 3.289917425185755,
      markPrice: 4037.84,
    };

    const expectedOrder = {
      symbol: "PERP_ETH_USDC",
      price: "4024.21",
      quantity: "0.2294",
      reduce_only: false,
      side: "BUY",
      type: "LIMIT",
      algo_type: "STOP",
      trigger_price: "4010.96",
      trigger_price_type: "MARK_PRICE",
    };

    const createdOrder = orderCreator.create(values as any, config as any);

    expect(createdOrder).toEqual(expectedOrder);
  });

  it("should create a stop limit order", () => {
    const values = {
      reduce_only: false,
      side: "BUY",
      order_type: "STOP_LIMIT",
      isStopOrder: true,
      symbol: "PERP_ETH_USDC",
      visible_quantity: 0,
      order_price: "3068.09",
      order_quantity: "0.2457",
      trigger_price: "3058.09",
      total: "753.82",
    } as OrderEntity;
    const config = {
      symbol: {
        symbol: "PERP_ETH_USDC",
        quote_min: 0,
        quote_max: 100000,
        quote_tick: 0.01,
        base_min: 0.0001,
        base_max: 320,
        base_tick: 0.0001,
        min_notional: 10,
        price_range: 0.03,
        price_scope: 0.4,
        std_liquidation_fee: 0.025,
        liquidator_fee: 0.0125,
        claim_insurance_fund_discount: 0.0075,
        funding_period: 8,
        cap_funding: 0.00375,
        floor_funding: -0.00375,
        interest_rate: 0.0001,
        created_time: 1693820915671,
        updated_time: 1709888598319,
        liquidation_tier: 1,
        base_mmr: 0.025,
        base_imr: 0.05,
        base_dp: 4,
        quote_dp: 2,
        base: "ETH",
        quote: "USDC",
        type: "PERP",
        name: "ETH-PERP",
      },
      maxQty: 3.017443914363575,
      markPrice: 4033.12,
    };

    const expectedOrder = {
      symbol: "PERP_ETH_USDC",
      price: "3068.09",
      quantity: "0.2457",
      visible_quantity: 0,
      reduce_only: false,
      side: "BUY",
      type: "LIMIT",
      algo_type: "STOP",
      trigger_price: "3058.09",
      trigger_price_type: "MARK_PRICE",
    };

    const createdOrder = orderCreator.create(values as any, config as any);

    expect(createdOrder).toEqual(expectedOrder);
  });
});
