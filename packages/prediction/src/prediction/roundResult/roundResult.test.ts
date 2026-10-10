import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import assert from "node:assert/strict";
import test from "node:test";
import type { API } from "@orderly.network/types";
import { normalizeBinaryHistory } from "../binary/binaryHistory";
import type { BinaryInfoDetail } from "../binary/binaryInfo";
import type { RoundResultState } from "./roundResult.script";
import { BinarySettlementDetailsUI, RoundResultUI } from "./roundResult.ui";

const t0 = Date.UTC(2026, 9, 9, 12);
const row = {
  symbol: "PERP_BTC5M2610091200_USDC",
  observation_start_at: t0,
  expire_at: t0 + 300_000,
  s0: 100,
  s1: 101,
  outcome: "UP",
  settlement_price_per_share: 1,
  result_committed_at: t0 + 301_000,
  index_price_symbol: "PERP_BTC_USDC",
} as BinaryInfoDetail;
const record = normalizeBinaryHistory({
  position_id: 1,
  symbol: row.symbol,
  side: "LONG",
  position_status: "closed",
  type: "trade",
  closed_position_qty: 100,
  avg_open_price: 0.4,
  avg_close_price: 1,
  trading_fee: 0.00006,
  realized_pnl: 60,
  open_timestamp: t0,
  close_timestamp: t0 + 310_000,
  last_update_time: t0 + 310_000,
  outcome: "UP",
  settlement_price_per_share: 1,
  settled_at: t0 + 310_000,
} as API.PositionHistory);
const props = (overrides: Partial<RoundResultState> = {}) =>
  ({
    row,
    outcome: "up",
    records: [],
    conflict: false,
    status: undefined,
    historyLoading: false,
    historyFailed: false,
    detailAvailable: false,
    detailLoading: false,
    detailFailed: false,
    nextRoundAvailable: false,
    retryDetail: () => {},
    showSettlement: () => {},
    goToNextRound: () => {},
    ...overrides,
    marketName: "BTC",
    intervalSeconds: 300,
  }) as RoundResultState & { marketName: string; intervalSeconds: number };
const text = (html: string) => html.replace(/<[^>]+>/g, "");

test("published card shows public data without inventing personal completion or net PnL", () => {
  const html = renderToStaticMarkup(createElement(RoundResultUI, props()));
  assert.match(text(html), /Outcome: Up/);
  assert.match(text(html), /PERP_BTC5M2610091200_USDC/);
  assert.match(text(html), /Opening price.*100.*Final price.*101/);
  assert.doesNotMatch(text(html), /Position segment settled|Net PnL/);
  assert.match(html, /<button[^>]* disabled=""[^>]*>Go to next round/);
});
test("known participation with delayed history renders pending amounts, completed segment shows verified facts", () => {
  const pending = renderToStaticMarkup(
    createElement(RoundResultUI, props({ status: "processing" })),
  );
  assert.match(text(pending), /Funds are being credited/);
  assert.match(text(pending), /Net PnL--Settled time--/);
  assert.doesNotMatch(text(pending), /Position segment settled/);
  const completed = renderToStaticMarkup(
    createElement(
      RoundResultUI,
      props({ records: [record], nextRoundAvailable: true }),
    ),
  );
  assert.match(text(completed), /Position segment settled/);
  assert.match(text(completed), /59\.99994/);
  assert.match(text(completed), /Settlement details/);
  assert.doesNotMatch(
    completed,
    /<button[^>]* disabled=""[^>]*>Go to next round/,
  );
});
test("settlement detail consumes normalized amounts, tiny actual fee and zero payout; invalid fields stay missing", () => {
  const html = renderToStaticMarkup(
    createElement(BinarySettlementDetailsUI, {
      symbol: row.symbol,
      records: [record],
      conflict: false,
      loading: false,
      failed: false,
    }),
  );
  assert.match(text(html), /Investment40/);
  assert.match(text(html), /Trading fee0\.00006/);
  assert.match(text(html), /Payout100/);
  const zero = normalizeBinaryHistory({
    ...record.source,
    outcome: "DOWN",
    settlement_price_per_share: 0,
    avg_close_price: 0,
    realized_pnl: -40,
  });
  const loss = renderToStaticMarkup(
    createElement(BinarySettlementDetailsUI, {
      records: [zero],
      conflict: false,
      loading: false,
      failed: false,
    }),
  );
  assert.match(text(loss), /Payout0/);
  assert.match(text(loss), /-40\.00006/);
  const invalid = {
    ...record,
    issues: ["missing_actual_fee"],
    tradingFee: undefined,
  };
  const missing = renderToStaticMarkup(
    createElement(BinarySettlementDetailsUI, {
      records: [invalid],
      conflict: false,
      loading: false,
      failed: true,
    }),
  );
  assert.match(text(missing), /Unable to load personal settlement records/);
  assert.match(text(missing), /Trading fee--/);
  assert.match(text(missing), /Net PnL--Settled time--/);
  assert.doesNotMatch(text(missing), /Position segment settled/);
});
test("a conflicting segment does not hide another verified segment's quantity", () => {
  const valid = normalizeBinaryHistory({ ...record.source, position_id: 2 });
  const html = renderToStaticMarkup(
    createElement(BinarySettlementDetailsUI, {
      records: [record, valid],
      conflict: true,
      conflictedRecordKeys: [record.recordKey],
      loading: false,
      failed: false,
    }),
  );
  const segments = text(html).split("Time");
  assert.match(segments[1], /Quantity--Investment--/);
  assert.match(segments[2], /Quantity100\.0000Investment40/);
  assert.match(segments[2], /Net PnL59\.99994/);
});

test("legacy whole-query conflicts still hide unverified quantities", () => {
  const html = renderToStaticMarkup(
    createElement(BinarySettlementDetailsUI, {
      records: [record],
      conflict: true,
      loading: false,
      failed: false,
    }),
  );
  assert.match(text(html), /Quantity--Investment--/);
});
