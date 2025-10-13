describe("limitOrderCreator", () => {});
import { OrderSide } from "@kodiak-finance/orderly-types";
import { LimitOrderCreator } from "../limitOrderCreator";
import { OrderType } from "@kodiak-finance/orderly-types";
import { OrderEntity } from "@kodiak-finance/orderly-types";
import { ValuesDepConfig } from "../interface";

describe("LimitOrderCreator", () => {
  let limitOrderCreator: LimitOrderCreator;

  beforeEach(() => {
    limitOrderCreator = new LimitOrderCreator();
  });

  test("should create a limit order with the provided values", () => {
    const values = {
      reduce_only: false,
      side: "BUY",
      order_type: "LIMIT",
      isStopOrder: false,
      symbol: "PERP_ETH_USDC",
      visible_quantity: 1,
      order_price: "4015.41",
      order_quantity: "0.2936",
      trigger_price: "",
      total: "1178.92",
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
      maxQty: 3.397012059831987,
      markPrice: 4019.75,
    };

    const expectedOrder = {
      symbol: "PERP_ETH_USDC",
      order_type: "LIMIT",
      side: "BUY",
      reduce_only: false,
      order_quantity: "0.2936",

      order_price: "4015.41",
    };

    const createdOrder = limitOrderCreator.create(values, config as any);

    expect(createdOrder).toEqual(expectedOrder);
  });
});
