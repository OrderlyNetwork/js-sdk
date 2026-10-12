import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import assert from "node:assert/strict";
import test from "node:test";
import type { API } from "@orderly.network/types";
import { normalizeBinaryHistory } from "../binary/binaryHistory";
import type { BinaryInfoDetail } from "../binary/binaryInfo";
import type { RoundResultState } from "./roundResult.script";
import { RoundResultUI, SettlementSegments } from "./roundResult.ui";

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
    goToNextRound: () => {},
    ...overrides,
    marketName: "BTC",
    intervalSeconds: 300,
  }) as RoundResultState & { marketName: string; intervalSeconds: number };
const text = (html: string) => html.replace(/<[^>]+>/g, "");

test("published result restores the centered outcome card without details or actions", () => {
  for (const outcome of ["up", "down"] as const) {
    const html = renderToStaticMarkup(
      createElement(
        RoundResultUI,
        props({
          outcome,
          records: [record],
          status: "processing",
          nextRoundAvailable: true,
        }),
      ),
    );
    assert.match(
      text(html),
      outcome === "up" ? /Outcome: Up/ : /Outcome: Down/,
    );
    assert.match(text(html), /BTC ·/);
    assert.match(html, /<svg/);
    assert.match(html, /oui-rounded-full/);
    assert.match(
      html,
      outcome === "up" ? /oui-bg-trade-profit\/15/ : /oui-bg-trade-loss\/15/,
    );
    assert.doesNotMatch(
      text(html),
      /Symbol|Opening price|Final price|Net PnL|Funds are being credited|Go to next round/,
    );
    assert.doesNotMatch(html, /<button/);
  }
});

test("settlement segments retain verified personal completion facts", () => {
  const completed = renderToStaticMarkup(
    createElement(SettlementSegments, { records: [record], conflict: false }),
  );
  assert.match(text(completed), /Position segment settled/);
  assert.match(text(completed), /59\.99994/);
});
