// Import AlgoOrderType enum
import { AlgoOrderType } from "@orderly.network/types";
import {
  offsetToPrice,
  priceToOffset,
  offsetPercentageToPrice,
  priceToOffsetPercentage,
  pnlToPrice,
  priceToPnl,
} from "../utils"; // Import functions to be tested

describe("offsetToPrice", () => {
  test("Calculates price correctly for TAKE_PROFIT type with positive offset", () => {
    expect(offsetToPrice(100, 10, AlgoOrderType.TAKE_PROFIT)).toBe(110);
  });

  test("Calculates price correctly for STOP_LOSS type with negative offset", () => {
    expect(offsetToPrice(100, 10, AlgoOrderType.STOP_LOSS)).toBe(90);
  });
});

describe("priceToOffset", () => {
  test("Calculates offset correctly for TAKE_PROFIT type with target price above mark price", () => {
    expect(priceToOffset(100, 110, AlgoOrderType.TAKE_PROFIT)).toBe(10);
  });

  test("Calculates offset correctly for STOP_LOSS type with target price below mark price", () => {
    expect(priceToOffset(100, 90, AlgoOrderType.STOP_LOSS)).toBe(10);
  });
});

describe("offsetPercentageToPrice", () => {
  test("Calculates price correctly for TAKE_PROFIT type with positive percentage offset", () => {
    expect(offsetPercentageToPrice(100, 10, AlgoOrderType.TAKE_PROFIT)).toBe(
      110
    );
  });

  test("Calculates price correctly for STOP_LOSS type with negative percentage offset", () => {
    expect(offsetPercentageToPrice(100, 10, AlgoOrderType.STOP_LOSS)).toBe(90);
  });
});

describe("priceToOffsetPercentage", () => {
  test("Calculates offset percentage correctly for TAKE_PROFIT type with target price above mark price", () => {
    expect(priceToOffsetPercentage(100, 110, AlgoOrderType.TAKE_PROFIT)).toBe(
      0.1
    );
  });

  test("Calculates offset percentage correctly for STOP_LOSS type with target price below mark price", () => {
    expect(priceToOffsetPercentage(100, 90, AlgoOrderType.STOP_LOSS)).toBe(0.1);
  });
});

describe("pnlToPrice", () => {
  test("Calculates price correctly for TAKE_PROFIT type with positive pnl", () => {
    expect(pnlToPrice(100, 10, AlgoOrderType.TAKE_PROFIT)).toBe(110);
  });

  test("Calculates price correctly for STOP_LOSS type with negative pnl", () => {
    expect(pnlToPrice(100, 10, AlgoOrderType.STOP_LOSS)).toBe(90);
  });
});

describe("priceToPnl", () => {
  test("Calculates pnl correctly for TAKE_PROFIT type with target price above mark price", () => {
    expect(priceToPnl(100, 110, AlgoOrderType.TAKE_PROFIT)).toBe(10);
  });

  test("Calculates pnl correctly for STOP_LOSS type with target price below mark price", () => {
    expect(priceToPnl(100, 90, AlgoOrderType.STOP_LOSS)).toBe(10);
  });
});
