import assert from "node:assert/strict";
import test from "node:test";
import type { API } from "@orderly.network/types";
import type { PredictionAccountPanelState } from "../../prediction.types";
import { buildHoldingsPositionRows } from "./holdingsTable.script";

const state = (
  patch: Partial<PredictionAccountPanelState> = {},
): PredictionAccountPanelState => ({
  accountReady: false,
  roundNow: 0,
  balance: 0,
  positions: [],
  openOrders: [],
  pendingOrdersComplete: true,
  history: [],
  hasFeeConfig: true,
  isSubmitting: false,
  feeRates: { takerRate: 0, makerRate: 0, takerBps: 0, makerBps: 0 },
  isRegionRestricted: false,
  ordersLoading: false,
  positionsLoading: false,
  settlements: [],
  historyRecords: [],
  historyLoading: false,
  pendingSettlementSymbols: [],
  availableQuantity: () => 0,
  isOrderTradable: () => false,
  cancelOrder: async () => undefined,
  cancelAllOrders: async () => true,
  editPendingOrder: async () => true,
  estimateFee: () => undefined,
  ...patch,
});

const roundRow = (symbol: string, expireAt: number) =>
  ({ symbol, expire_at: expireAt }) as API.BinaryInfoRow;

const all = () => true;

test("each row reads its own round expiry via roundBySymbol", () => {
  const rows = buildHoldingsPositionRows(
    state({
      positions: [
        { outcome: "up", quantity: 2, averagePrice: 0.5, symbol: "A" },
        { outcome: "down", quantity: 1, averagePrice: 0.4, symbol: "B" },
        { outcome: "up", quantity: 1, averagePrice: 0.3 },
      ],
      roundBySymbol: (symbol) =>
        symbol === "A" ? roundRow("A", 1_000) : undefined,
    }),
    all,
  );
  assert.equal(rows[0].roundInfo?.expire_at, 1_000);
  assert.deepEqual(rows[0].roundInfo, roundRow("A", 1_000));
  assert.equal(rows[1].roundInfo?.expire_at, undefined);
  assert.equal(rows[2].roundInfo?.expire_at, undefined);
});

test("states without roundBySymbol leave expiry undefined", () => {
  const rows = buildHoldingsPositionRows(
    state({
      positions: [
        { outcome: "up", quantity: 1, averagePrice: 0.5, symbol: "A" },
      ],
    }),
    all,
  );
  assert.equal(rows[0].roundInfo?.expire_at, undefined);
});

test("all rows use position marks regardless of selected-round book prices", () => {
  const rows = buildHoldingsPositionRows(
    state({
      positions: [
        {
          outcome: "up",
          quantity: 2,
          averagePrice: 0.5,
          markPrice: 0.7,
          symbol: "A",
        },
        {
          outcome: "up",
          quantity: 1,
          averagePrice: 0.4,
          markPrice: 0.8,
          symbol: "B",
        },
      ],
      roundBySymbol: (symbol) => (symbol ? roundRow(symbol, 2_000) : undefined),
      marketView: {
        selectedRow: roundRow("A", 2_000),
        outcomePrices: { up: 0.6, down: 0.4 },
        round: 100,
        roundPhase: "trading",
        isRoundTradable: true,
      },
    }),
    all,
  );
  assert.equal(rows[0].isSelectedRound, true);
  assert.equal(rows[0].lastPrice, 0.7);
  assert.equal(rows[0].uPnL, 0.4);
  assert.equal(rows[0].roundInfo?.expire_at, 2_000);
  assert.equal(rows[1].isSelectedRound, false);
  assert.equal(rows[1].lastPrice, 0.8);
  assert.equal(rows[1].uPnL, 0.4);
});

test("resolved metadata remains attached to its row when selection changes", () => {
  const resolved = {
    ...roundRow("A", 1_000),
    outcome: "DOWN",
    result_committed_at: 1_100,
  } as API.BinaryInfoRow;
  const snapshot = state({
    positions: [{ outcome: "up", quantity: 1, averagePrice: 0.5, symbol: "A" }],
    roundBySymbol: (symbol) => (symbol === "A" ? resolved : undefined),
  });
  for (const symbol of ["A", "B"]) {
    const rows = buildHoldingsPositionRows(
      {
        ...snapshot,
        marketView: {
          selectedRow: roundRow(symbol, 2_000),
          outcomePrices: { up: 0.6, down: 0.4 },
          round: 100,
          roundPhase: "trading",
          isRoundTradable: true,
        },
      },
      all,
    );
    assert.equal(rows[0].roundInfo, resolved);
    assert.equal(rows[0].roundInfo?.outcome, "DOWN");
  }
});

test("selected metadata is a fallback only for the matching position", () => {
  const selectedRow = roundRow("A", 2_000);
  const rows = buildHoldingsPositionRows(
    state({
      positions: [
        { outcome: "up", quantity: 1, averagePrice: 0.5, symbol: "A" },
        { outcome: "up", quantity: 1, averagePrice: 0.5, symbol: "B" },
      ],
      marketView: {
        selectedRow,
        outcomePrices: { up: 0.6, down: 0.4 },
        round: 100,
        roundPhase: "trading",
        isRoundTradable: true,
      },
    }),
    all,
  );
  assert.equal(rows[0].roundInfo, selectedRow);
  assert.equal(rows[1].roundInfo, undefined);
});

const valuationState = (
  round: API.BinaryInfoRow,
  patch: Partial<PredictionAccountPanelState> = {},
) =>
  state({
    roundNow: 2_000,
    positions: [
      {
        outcome: "up",
        quantity: 10,
        averagePrice: 0.4,
        markPrice: 0.6,
        symbol: "A",
      },
      {
        outcome: "down",
        quantity: 5,
        averagePrice: 0.3,
        markPrice: 0.4,
        symbol: "A",
      },
    ],
    roundBySymbol: () => round,
    ...patch,
  });

const publishedRound = (outcome: "UP" | "DOWN"): API.BinaryInfoRow => ({
  ...roundRow("A", 2_000),
  status: "DELISTING",
  s0: 100,
  s1: outcome === "UP" ? 101 : 99,
  outcome,
  result_committed_at: 2_100,
  settlement_price_per_share: outcome === "UP" ? 1 : 0,
});

test("expiry clears stale marks until the official result is published", () => {
  const round = roundRow("A", 2_000);
  const live = buildHoldingsPositionRows(
    valuationState(round, { roundNow: 1_999 }),
    all,
  );
  assert.equal(live[0].lastPrice, 0.6);
  assert.equal(live[0].uPnL, 2);
  assert.equal(live[1].lastPrice, 0.4);
  assert.equal(live[1].uPnL, 0.5);
  const expired = buildHoldingsPositionRows(valuationState(round), all);
  for (const row of expired) {
    assert.equal(row.lastPrice, undefined);
    assert.equal(row.uPnL, undefined);
  }
});

for (const outcome of ["UP", "DOWN"] as const) {
  test(`published ${outcome} uses outcome settlement prices and gross pending PnL`, () => {
    const rows = buildHoldingsPositionRows(
      valuationState(publishedRound(outcome)),
      all,
    );
    assert.equal(rows[0].lastPrice, outcome === "UP" ? 1 : 0);
    assert.equal(rows[1].lastPrice, outcome === "UP" ? 0 : 1);
    assert.equal(rows[0].uPnL, outcome === "UP" ? 6 : -4);
    assert.equal(rows[1].uPnL, outcome === "UP" ? -1.5 : 3.5);
  });
}

test("unpublished or inconsistent results never fabricate settlement values", () => {
  for (const patch of [
    { result_committed_at: null },
    { outcome: null },
    { settlement_price_per_share: null },
    { settlement_price_per_share: 0 },
    { s1: null },
  ]) {
    const rows = buildHoldingsPositionRows(
      valuationState({ ...publishedRound("UP"), ...patch }),
      all,
    );
    assert.equal(rows[0].lastPrice, undefined);
    assert.equal(rows[0].uPnL, undefined);
  }
});

test("missing and invalid live marks do not fall back to the selected book", () => {
  for (const markPrice of [undefined, NaN, Infinity, -0.1, 1.1]) {
    const rows = buildHoldingsPositionRows(
      valuationState(roundRow("A", 2_000), {
        roundNow: 1_000,
        positions: [
          {
            outcome: "up",
            quantity: 10,
            averagePrice: 0.4,
            markPrice,
            symbol: "A",
          },
        ],
        marketView: {
          selectedRow: roundRow("A", 2_000),
          outcomePrices: { up: 0.7, down: 0.3 },
          roundPhase: "trading",
          isRoundTradable: true,
        },
      }),
      all,
    );
    assert.equal(rows[0].lastPrice, undefined);
    assert.equal(rows[0].uPnL, undefined);
  }
});

test("selected detail can supply a newer published result without erasing snapshot results", () => {
  const round = publishedRound("UP");
  const view = {
    selectedRow: round,
    outcomePrices: { up: undefined, down: undefined },
    roundPhase: "resolvedUp" as const,
    isRoundTradable: false,
  };
  const rows = buildHoldingsPositionRows(
    valuationState(
      { ...round, result_committed_at: null },
      { marketView: view },
    ),
    all,
  );
  assert.equal(rows[0].lastPrice, 1);
  const stale = buildHoldingsPositionRows(
    valuationState(round, {
      marketView: {
        ...view,
        selectedRow: { ...round, result_committed_at: null },
      },
    }),
    all,
  );
  assert.equal(stale[0].lastPrice, 1);
});

test("expired symbols outside the metadata snapshot do not reuse stale marks", () => {
  const rows = buildHoldingsPositionRows(
    state({
      roundNow: Date.UTC(2026, 0, 1, 12, 5),
      positions: [
        {
          outcome: "up",
          quantity: 1,
          averagePrice: 0.4,
          markPrice: 0.6,
          symbol: "PERP_BTC5M2601011200_USDC",
        },
      ],
    }),
    all,
  );
  assert.equal(rows[0].lastPrice, undefined);
  assert.equal(rows[0].uPnL, undefined);
});
