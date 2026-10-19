import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import assert from "node:assert/strict";
import test from "node:test";
import { OrderSide, OrderStatus, type API } from "@orderly.network/types";
import {
  PredictionOrderCell,
  type PredictionOrderCellProps,
} from "../dataPanels/orders/predictionOrderCell.ui";
import { PredictionPnl } from "./cells.ui";

const markup = (value: number) =>
  renderToStaticMarkup(createElement(PredictionPnl, { value }));

test("realized PnL cells render original API values for both order history layouts", () => {
  for (const side of [OrderSide.BUY, OrderSide.SELL]) {
    for (const value of [
      9.4227,
      148.4364,
      -260.75,
      -8,
      0,
      0.001,
      -0.001,
      undefined,
      NaN,
      Infinity,
      -Infinity,
    ]) {
      const order = {
        order_id: 25145227253,
        symbol: "PERP_BTC5M2610190920_USDC",
        side,
        reduce_only: true,
        type: "SETTLEMENT",
        status: OrderStatus.FILLED,
        realized_pnl: value,
        total_fee: 0.12,
        created_time: 1792401942000,
      } as API.Order;
      const cell = createElement(PredictionOrderCell, {
        field: "realized_pnl",
        state: {},
        order,
      } as PredictionOrderCellProps);
      const html = renderToStaticMarkup(cell);
      if (value != null && Number.isFinite(value)) {
        assert.equal(html, markup(value));
        const rtl = renderToStaticMarkup(
          createElement("div", { dir: "rtl" }, cell),
        );
        assert.equal(rtl, `<div dir="rtl">${html}</div>`);
        assert.match(html, /^<span[^>]*dir="ltr"/);
        if (value === -8) assert.match(html, />-8\.00</);
      } else {
        assert.equal(html, "--");
      }
    }
  }
});

test("small PnL retains its original magnitude and profit/loss color", () => {
  const profit = markup(0.001);
  assert.match(profit, />0\.001</);
  assert.match(profit, /oui-text-trade-profit/);
  const loss = markup(-0.001);
  assert.match(loss, />-0\.001</);
  assert.match(loss, /oui-text-trade-loss/);
  assert.match(markup(-0.00000123), />-0\.00000123</);
});

test("zero PnL is neutral and ordinary PnL keeps its previous rounding", () => {
  for (const zero of [0, -0]) {
    assert.match(markup(zero), />0\.00</);
    assert.match(markup(zero), /oui-text-base-contrast-54/);
  }
  assert.match(markup(1.239), />1\.23</);
  assert.match(markup(-1.231), />-1\.24</);
  for (const value of [NaN, Infinity, -Infinity]) {
    assert.match(markup(value), />--</);
    assert.doesNotMatch(markup(value), /oui-text-trade-(profit|loss)/);
  }
});

test("order executed and notional cells preserve sub-cent USDC values", () => {
  const render = (field: string, status: "filled" | "pending") =>
    renderToStaticMarkup(
      createElement(PredictionOrderCell, {
        field,
        state: {},
        order: {
          symbol: "PERP_BTC5M2610130840_USDC",
          side: "BUY",
          type: "LIMIT",
          status: status === "filled" ? OrderStatus.FILLED : OrderStatus.NEW,
          quantity: 0.01,
          total_executed_quantity: 0.01,
          price: 0.55,
          average_executed_price: 0.5,
        },
      } as PredictionOrderCellProps),
    );
  assert.match(render("executed", "filled"), />0\.005</);
  assert.match(render("notional", "filled"), />0\.005</);
  assert.match(render("notional", "pending"), />0\.0055</);
});

test("PnL stays LTR inside RTL containers without changing signs or colors", () => {
  for (const value of [0.001, -0.001, -0.00000123, 0, -0]) {
    const html = renderToStaticMarkup(
      createElement(
        "div",
        { dir: "rtl" },
        createElement(PredictionPnl, { value }),
      ),
    );
    assert.match(html, /^<div dir="rtl"><span[^>]*dir="ltr"/);
    assert.ok(html.includes(markup(value)));
  }
});

test("executed and both notional paths stay LTR inside RTL containers", () => {
  for (const [field, status, expected] of [
    ["executed", "filled", "0.005"],
    ["notional", "filled", "0.005"],
    ["notional", "pending", "0.0055"],
  ] as const) {
    const html = renderToStaticMarkup(
      createElement(
        "div",
        { dir: "rtl" },
        createElement(PredictionOrderCell, {
          field,
          state: {},
          order: {
            symbol: "PERP_BTC5M2610130840_USDC",
            side: "BUY",
            type: "LIMIT",
            status: status === "filled" ? OrderStatus.FILLED : OrderStatus.NEW,
            quantity: 0.01,
            total_executed_quantity: 0.01,
            price: 0.55,
            average_executed_price: 0.5,
          },
        } as PredictionOrderCellProps),
      ),
    );
    assert.match(html, /^<div dir="rtl"><span[^>]*dir="ltr"/);
    assert.ok(html.includes(`>${expected}</span>`));
  }
});
