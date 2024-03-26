describe("StopMarketOrderCreator", () => {});
import { StopMarketOrderCreator } from "../stopMarketOrderCreator";

describe("StopMarketOrderCreator", () => {
  let orderCreator: StopMarketOrderCreator;

  beforeEach(() => {
    orderCreator = new StopMarketOrderCreator();
  });

  it("should create a stop market order", () => {
    const values = {
      reduce_only: false,
      side: "BUY",
      order_type: "STOP_MARKET",
      isStopOrder: true,
      symbol: "PERP_ETH_USDC",
      visible_quantity: 1,
      order_price: "3880.03",
      order_quantity: "0.5007",
      trigger_price: "3879.7",
      total: "1942.73",
    };

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
      maxQty: 4.180176073796722,
      markPrice: 3980.66,
    };

    const expectedOrder = {
      symbol: "PERP_ETH_USDC",
      trigger_price: "3879.7",
      algo_type: "STOP",
      type: "MARKET",
      quantity: "0.5007",
      trigger_price_type: "MARK_PRICE",
      side: "BUY",
      reduce_only: false,
    };

    const createdOrder = orderCreator.create(values as any);

    expect(createdOrder).toEqual(expectedOrder);
  });
});
