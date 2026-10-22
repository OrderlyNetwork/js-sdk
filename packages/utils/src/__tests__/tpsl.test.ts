/// <reference types="jest" />
import {
  canChangeTPSLOrderType,
  isConfiguredPendingTPSLLeg,
  isTPSLActivationAllowed,
  getTPSLEstimatePrice,
  getTPSLLeg,
  getTPSLQuantity,
  isEntirePositionTPSL,
  isPositionalTPSL,
  isTPSLTriggered,
  matchesTPSLPosition,
  withTPSLProvenance,
} from "../tpsl";

describe("Configured pending TP/SL legs", () => {
  const ancestor = { algo_type: "BRACKET" };
  const parent = { algo_order_id: 10, algo_type: "TP_SL", is_activated: false };
  const child = {
    algo_type: "TAKE_PROFIT",
    is_activated: false,
    trigger_price: 4100,
  };

  it.each(["TP_SL", "POSITIONAL_TP_SL"])(
    "recognizes configured %s protection with ancestor context",
    (algoType) => {
      expect(
        isConfiguredPendingTPSLLeg(
          { ...parent, algo_type: algoType },
          child,
          ancestor,
        ),
      ).toBe(true);
    },
  );

  it.each([
    { parent_algo_type: "BRACKET" },
    { parent_algo_order_id: 1 },
    { root_algo_order_id: 1 },
    { root_algo_order_algo_type: "BRACKET" },
  ])("recognizes persisted provenance %j", (provenance) => {
    expect(
      isConfiguredPendingTPSLLeg({ ...parent, ...provenance }, child),
    ).toBe(true);
  });

  it("keeps standalone and activated-parent placeholders distinct", () => {
    expect(isConfiguredPendingTPSLLeg(parent, child)).toBe(false);
    expect(
      isConfiguredPendingTPSLLeg(
        { ...parent, parent_algo_order_id: 0, root_algo_order_id: 10 },
        child,
      ),
    ).toBe(false);
    expect(
      isConfiguredPendingTPSLLeg(
        { ...parent, is_activated: true },
        child,
        ancestor,
      ),
    ).toBe(false);
    expect(
      isConfiguredPendingTPSLLeg(
        { ...parent, is_activated: undefined },
        child,
        ancestor,
      ),
    ).toBe(false);
  });

  it.each([
    undefined,
    { ...child, trigger_price: 0 },
    { ...child, trigger_price: NaN },
    { ...child, is_triggered: true },
    { ...child, algo_status: "CANCELLED" },
    { ...child, status: "EXPIRED" },
  ])("does not treat an empty or finished leg as configured: %j", (leg) => {
    expect(isConfiguredPendingTPSLLeg(parent, leg, ancestor)).toBe(false);
  });
});

describe("TP/SL activation policy", () => {
  it.each(["TP_SL", "POSITIONAL_TP_SL"])(
    "allows independent %s parents, including legacy missing metadata",
    (algoType) => {
      expect(isTPSLActivationAllowed({ algo_type: algoType })).toBe(true);
      expect(
        isTPSLActivationAllowed({
          algo_type: algoType,
          algo_order_id: 10,
          root_algo_order_id: 10,
          parent_algo_order_id: 0,
        }),
      ).toBe(true);
    },
  );

  it.each([
    { parent_algo_type: "BRACKET" },
    { parent_algo_order_id: 1 },
    { root_algo_order_id: 1 },
    { root_algo_order_algo_type: "BRACKET" },
  ])("uses provenance %j to detect nested parents", (provenance) => {
    const parent = { algo_type: "TP_SL", algo_order_id: 10, ...provenance };
    expect(isTPSLActivationAllowed(parent)).toBe(false);
    expect(isTPSLActivationAllowed({ ...parent, is_activated: true })).toBe(
      true,
    );
    expect(
      isTPSLActivationAllowed({
        ...parent,
        algo_type: "POSITIONAL_TP_SL",
        is_activated: true,
      }),
    ).toBe(false);
  });

  it("uses parent activation rather than partial fills of the Bracket root", () => {
    const parent = { algo_type: "TP_SL" };
    const ancestor = { algo_type: "BRACKET", total_executed_quantity: 1 };
    expect(isTPSLActivationAllowed(parent, ancestor)).toBe(false);
    expect(
      isTPSLActivationAllowed({ ...parent, is_activated: true }, ancestor),
    ).toBe(true);
    expect(isTPSLActivationAllowed({ algo_type: "BRACKET" })).toBe(false);
  });

  it.each(["TAKE_PROFIT", "STOP_LOSS"])(
    "only permits eligible %s placeholders",
    (algoType) => {
      const parent = { algo_type: "TP_SL" };
      const child = { algo_type: algoType, is_activated: false };
      expect(canChangeTPSLOrderType(parent, child)).toBe(true);
      expect(canChangeTPSLOrderType(parent, undefined)).toBe(false);
      for (const state of [
        { is_activated: true },
        { is_activated: undefined },
        { is_triggered: true },
        { algo_status: "FILLED" },
        { algo_status: "CANCELLED" },
        { status: "EXPIRED" },
      ]) {
        expect(canChangeTPSLOrderType(parent, { ...child, ...state })).toBe(
          false,
        );
      }
    },
  );
});

const leaf = {
  symbol: "PERP_ETH_USDC",
  type: "LIMIT",
  algo_type: "TAKE_PROFIT",
  parent_algo_type: "POSITIONAL_TP_SL",
  trigger_price: 4100,
  price: 4110,
  quantity: 0,
  is_triggered: false,
  algo_status: "NEW",
};

describe("Positional lifecycle", () => {
  it("uses live quantity only before trigger", () => {
    expect(isPositionalTPSL(leaf)).toBe(true);
    expect(isEntirePositionTPSL(leaf)).toBe(true);
    expect(getTPSLQuantity(leaf, 2)).toBe(2);
    expect(getTPSLQuantity(leaf, 7)).toBe(7);
    expect(getTPSLQuantity(leaf)).toBeUndefined();
    const triggered = { ...leaf, is_triggered: true, quantity: 2 };
    expect(isEntirePositionTPSL(triggered)).toBe(false);
    expect(getTPSLQuantity(triggered, 7)).toBe(2);
    expect(
      getTPSLQuantity({ ...triggered, total_executed_quantity: 1 }, 9),
    ).toBe(2);
    expect(getTPSLQuantity({ ...triggered, quantity: 0 }, 7)).toBeUndefined();
  });
  it("uses execution evidence and trigger flags, not NEW or zero alone", () => {
    expect(isTPSLTriggered({ ...leaf, triggered: true })).toBe(true);
    expect(isTPSLTriggered({ ...leaf, trigger_time: 1000 })).toBe(true);
    expect(isTPSLTriggered({ ...leaf, is_triggered: true })).toBe(true);
    expect(isTPSLTriggered({ ...leaf, trigger_status: "SUCCESS" })).toBe(true);
    expect(isTPSLTriggered({ ...leaf, total_executed_quantity: 1 })).toBe(true);
    expect(isTPSLTriggered({ ...leaf, algo_status: "PARTIAL_FILLED" })).toBe(
      true,
    );
    expect(isTPSLTriggered({ ...leaf, quantity: 4 })).toBe(false);
  });
  it("does not reconstruct historical quantities from live positions", () => {
    expect(getTPSLQuantity(leaf, 5, true)).toBeUndefined();
    const cancelled = { ...leaf, algo_status: "CANCELLED" };
    expect(isEntirePositionTPSL(cancelled)).toBe(true);
    expect(getTPSLQuantity(cancelled, 5)).toBeUndefined();
    expect(
      getTPSLQuantity(
        { ...cancelled, is_triggered: true, quantity: 2 },
        5,
        true,
      ),
    ).toBe(2);
  });
  it("matches Cross and Isolated separately with CROSS default", () => {
    expect(
      matchesTPSLPosition(leaf, { symbol: leaf.symbol, margin_mode: "CROSS" }),
    ).toBe(true);
    expect(
      matchesTPSLPosition(leaf, {
        symbol: leaf.symbol,
        margin_mode: "ISOLATED",
      }),
    ).toBe(false);
    expect(
      matchesTPSLPosition(
        { ...leaf, margin_mode: "ISOLATED" },
        { symbol: leaf.symbol, marginMode: "ISOLATED" },
      ),
    ).toBe(true);
    expect(matchesTPSLPosition(leaf, { symbol: "PERP_BTC_USDC" })).toBe(false);
  });
  it("keeps direct Positional provenance below Bracket without mutating REST/WS inputs", () => {
    const raw = {
      algo_type: "BRACKET",
      margin_mode: "ISOLATED",
      child_orders: [
        {
          algo_type: "POSITIONAL_TP_SL",
          child_orders: [{ ...leaf, parent_algo_type: undefined }],
        },
      ],
    };
    const normalized = withTPSLProvenance(raw);
    const child = normalized.child_orders[0].child_orders[0];
    expect(child).toMatchObject({
      parent_algo_type: "POSITIONAL_TP_SL",
      margin_mode: "ISOLATED",
    });
    expect(isEntirePositionTPSL(child)).toBe(true);
    expect(
      raw.child_orders[0].child_orders[0].parent_algo_type,
    ).toBeUndefined();
  });
  it("separates estimate price from trigger price and preserves per-leg execution quantity", () => {
    expect(getTPSLEstimatePrice(leaf)).toBe(4110);
    expect(getTPSLEstimatePrice({ ...leaf, type: "CLOSE_POSITION" })).toBe(
      4100,
    );
    const parent = {
      algo_type: "POSITIONAL_TP_SL",
      quantity: 0,
      child_orders: [{ ...leaf, is_triggered: true, quantity: 2 }],
    };
    expect(getTPSLQuantity(getTPSLLeg(parent, "tp")!, 9)).toBe(2);
  });
});
