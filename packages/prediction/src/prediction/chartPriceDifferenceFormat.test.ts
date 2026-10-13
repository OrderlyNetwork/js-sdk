import assert from "node:assert/strict";
import test from "node:test";
import { getPriceDifference } from "./binary/binaryRoundView";
import { formatChartPriceDifferencePercent } from "./chartPriceDifferenceFormat";

test("formats the OR-7491 price difference without changing its amount", () => {
  const difference = getPriceDifference(82423.03, 82423.99)!;
  assert.equal(difference.amount, -0.96);
  assert.equal(
    formatChartPriceDifferencePercent(difference.percent),
    "−0.0012%",
  );
});

test("small changes retain two significant digits and their direction", () => {
  const cases: [number, string][] = [
    [0.0011647, "+0.0012%"],
    [-0.0011647, "−0.0012%"],
    [-0.0001, "−0.00010%"],
    [0.00125, "+0.0013%"],
    [-0.00125, "−0.0013%"],
    [0.009999, "+0.010%"],
    [0.0000001, "+0.00000010%"],
    [-0.000000012345, "−1.2e-8%"],
    [Number.MIN_VALUE, "+5.0e-324%"],
  ];
  for (const [percent, expected] of cases) {
    assert.equal(formatChartPriceDifferencePercent(percent), expected);
  }
});

test("ordinary changes preserve the existing two-decimal truncation", () => {
  for (const [percent, expected] of [
    [0.01, "+0.01%"],
    [-0.01, "−0.01%"],
    [1.239, "+1.23%"],
    [-1.239, "−1.23%"],
  ] as [number, string][]) {
    assert.equal(formatChartPriceDifferencePercent(percent), expected);
  }
});

test("zero is unsigned and unavailable percentages keep the placeholder", () => {
  for (const zero of [0, -0]) {
    assert.equal(formatChartPriceDifferencePercent(zero), "0.00%");
  }
  for (const missing of [undefined, null, NaN, Infinity, -Infinity]) {
    assert.equal(formatChartPriceDifferencePercent(missing), "--");
  }
});
