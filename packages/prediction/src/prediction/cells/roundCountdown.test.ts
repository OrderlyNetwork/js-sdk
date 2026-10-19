import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import assert from "node:assert/strict";
import test from "node:test";
import type { API } from "@orderly.network/types";
import { getTimestamp } from "@orderly.network/utils";
import { RoundCountdown } from "./cells.ui";

const markup = (roundInfo?: API.BinaryInfoRow) =>
  renderToStaticMarkup(createElement(RoundCountdown, { roundInfo }));

test("countdown shows time until expiry without terminal status or result", () => {
  const live = { expire_at: getTimestamp() + 120_000 } as API.BinaryInfoRow;
  assert.match(markup(live), /\d{2}:\d{2}/);
  for (const roundInfo of [
    undefined,
    { expire_at: Number.NaN },
    { expire_at: getTimestamp() - 1 },
    { expire_at: getTimestamp() - 1, outcome: "UP", status: "SETTLED" },
  ]) {
    const html = markup(roundInfo as API.BinaryInfoRow | undefined);
    assert.match(html, />--</);
    assert.doesNotMatch(html, /Settled|Closed|UP|resolved/i);
  }
});
