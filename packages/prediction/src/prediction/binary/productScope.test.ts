import assert from "node:assert/strict";
import test from "node:test";
import { matchesPredictionUnderlying } from "./productScope";

test("scope matches all periods and rounds for the same underlying", () => {
  assert.equal(
    matchesPredictionUnderlying("PERP_BTC5M2609301200_USDC", "PERP_BTC_USDC"),
    true,
  );
  assert.equal(
    matchesPredictionUnderlying("PERP_BTC15M2609301215_USDC", "PERP_BTC_USDC"),
    true,
  );
  assert.equal(
    matchesPredictionUnderlying("PERP_BTC10M2601010000_USDC", "PERP_BTC_USDC"),
    true,
  );
  assert.equal(
    matchesPredictionUnderlying("PERP_ETH5M2609301200_USDC", "PERP_BTC_USDC"),
    false,
  );
  assert.equal(
    matchesPredictionUnderlying("PERP_BTC5M2609301200_USDT", "PERP_BTC_USDC"),
    false,
  );
  assert.equal(
    matchesPredictionUnderlying("PERP_BTC5M2609301200_USDC", undefined),
    true,
  );
});
