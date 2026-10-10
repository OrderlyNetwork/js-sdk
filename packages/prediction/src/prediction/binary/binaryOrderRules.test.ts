import assert from "node:assert/strict";
import test from "node:test";
import { OrderSide } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import {
  estimateBinaryOrderFrozen,
  maxBinaryOrderQuantity,
  type BinaryCollateralSnapshot,
} from "./binaryCollateral";
import type { BinaryInfoRow } from "./binaryInfo";
import {
  binaryMaxQuoteInput,
  binaryProtectionPrice,
  binaryRejectionNotice,
  binarySubmissionNotice,
  binaryUpNotional,
  estimateBinarySlippage,
  isBinaryMarketBatchAllowed,
  parseSlippageTicks,
  quoteToBinaryQuantity,
  resolveBinaryOrderLimits,
  splitBinaryQuantity,
  submitBinaryBatches,
  toBinaryUpRequest,
  validateBinaryOrderSize,
  validBinaryFee,
} from "./binaryOrderRules";
import { getBinaryQuotes } from "./binaryQuotes";
import type { BinaryOrderBook } from "./useBinaryOrderbook";

const rules = {
  base_min: 0.01,
  base_max: 10000,
  base_tick: 0.01,
  min_notional: 5,
};
const flat: BinaryCollateralSnapshot = {
  positionQty: 0,
  orders: [],
  pendingBuyQty: 0,
  pendingSellQty: 0,
  reservations: [],
  mode: "detailed",
};

test("protection is two absolute ticks in the UP coordinate for every entry and exit", () => {
  const bbo = { bestBid: 0.4, bestAsk: 0.6 };
  assert.equal(binaryProtectionPrice("up", "buy", bbo, "2"), 0.62);
  assert.equal(binaryProtectionPrice("up", "sell", bbo, "2"), 0.38);
  assert.equal(binaryProtectionPrice("down", "buy", bbo, "2"), 0.62);
  assert.equal(binaryProtectionPrice("down", "sell", bbo, "2"), 0.38);
  assert.deepEqual(toBinaryUpRequest("down", "buy", 0.62), {
    upSide: OrderSide.SELL,
    upPrice: 0.38,
  });
  assert.equal(binaryProtectionPrice("up", "buy", bbo, "0"), 0.6);
  assert.equal(binaryProtectionPrice("down", "sell", bbo, "0"), 0.4);
  assert.equal(
    binaryProtectionPrice("up", "buy", { bestAsk: 0.95 }, "10"),
    0.99,
  );
  assert.equal(
    binaryProtectionPrice("down", "buy", { bestBid: 0.03 }, "10"),
    0.99,
  );
});

test("later market batches walk only unsent depth after earlier acceptance", async () => {
  let remainingQuantity = 210000;
  let book: BinaryOrderBook = {
    asks: [[0.5, remainingQuantity]],
    bids: [],
    downAsks: [],
    downBids: [],
  };
  const sizes: number[] = [];
  const result = await submitBinaryBatches(
    splitBinaryQuantity(remainingQuantity, 0.52, rules)!.map(
      (order_quantity) => ({ order_quantity }),
    ),
    async (batch) => {
      sizes.push(batch.length);
      remainingQuantity = batch.reduce(
        (value, order) =>
          new Decimal(value).sub(String(order.order_quantity)).toNumber(),
        remainingQuantity,
      );
      book = {
        ...book,
        asks: [
          [0.5, 10000],
          [0.6, 200000],
        ],
      };
      return {
        success: true,
        data: {
          rows: batch.map((_, i) => ({ order_id: sizes.length * 100 + i })),
        },
      };
    },
    () =>
      isBinaryMarketBatchAllowed({
        outcome: "up",
        side: "buy",
        remainingQuantity,
        displayPrice: 0.52,
        bbo: { bestAsk: 0.5 },
        book,
        slippage: "2",
        config: rules as BinaryInfoRow,
      }),
  );
  assert.deepEqual(sizes, [20, 1]);
  assert.equal(result.accepted, 21);
  assert.equal(result.unsent, 0);
  assert.equal(remainingQuantity, 0);
});

test("remaining market depth still blocks excess slippage and missing quotes", () => {
  const input: Parameters<typeof isBinaryMarketBatchAllowed>[0] = {
    outcome: "up",
    side: "buy",
    remainingQuantity: 10000,
    displayPrice: 0.52,
    bbo: { bestAsk: 0.5 },
    book: {
      asks: [
        [0.5, 100],
        [0.6, 9900],
      ],
      bids: [],
      downAsks: [],
      downBids: [],
    },
    slippage: "2",
    config: rules as BinaryInfoRow,
  };
  assert.equal(isBinaryMarketBatchAllowed(input), false);
  assert.equal(isBinaryMarketBatchAllowed({ ...input, bbo: {} }), false);
});

test("empty and one-sided books only disable entries needing the missing side", () => {
  assert.equal(binaryProtectionPrice("up", "buy", {}, "2"), undefined);
  assert.equal(
    binaryProtectionPrice("down", "buy", { bestAsk: 0.5 }, "2"),
    undefined,
  );
  assert.equal(binaryProtectionPrice("up", "buy", { bestAsk: 0.5 }, "2"), 0.52);
  assert.equal(
    getBinaryQuotes(undefined, 0.5).executablePrices.buy.down,
    undefined,
  );
  for (const bestAsk of [NaN, Infinity, 0, 1])
    assert.equal(
      binaryProtectionPrice("up", "buy", { bestAsk }, "2"),
      undefined,
    );
});

test("zero is a valid slippage setting, percentages and invalid values are rejected", () => {
  for (const value of ["0", "2", "10"])
    assert.equal(parseSlippageTicks(value), Number(value));
  for (const value of ["", "-1", "11", "1.5", "NaN", "Infinity", "2%", " "])
    assert.equal(parseSlippageTicks(value), undefined);
});

test("depth slippage measures VWAP ticks and permits partial IOC depth", () => {
  const asks = [
    { price: 0.5, quantity: 10 },
    { price: 0.54, quantity: 10 },
  ];
  assert.equal(estimateBinarySlippage("buy", 20, { asks, bids: [] }), 2);
  assert.equal(estimateBinarySlippage("buy", 100, { asks, bids: [] }), 2);
  assert.equal(estimateBinarySlippage("buy", 10, { asks, bids: [] }), 0);
  assert.equal(estimateBinarySlippage("sell", 10, { asks, bids: [] }), null);
  assert.equal(estimateBinarySlippage("buy", 0, { asks, bids: [] }), null);
  assert.equal(
    estimateBinarySlippage("sell", 20, {
      asks: [],
      bids: [
        { price: 0.5, quantity: 10 },
        { price: 0.46, quantity: 10 },
      ],
    }),
    2,
  );
});

test("USDC sizing floors shares without consuming the rounding remainder", () => {
  assert.equal(quoteToBinaryQuantity("10.00", 0.3), 33.33);
  assert.equal(
    new Decimal(quoteToBinaryQuantity("10.00", 0.3)).mul(0.3).toNumber(),
    9.999,
  );
  assert.equal(quoteToBinaryQuantity("100", 0.5), 200);
  assert.equal(quoteToBinaryQuantity("1.00", 0.9, 0.1), 1.1);
  assert.equal(quoteToBinaryQuantity("10", 0), 0);
});

test("MAX cent inputs avoid a second truncation and never buy beyond affordable shares", () => {
  assert.equal(binaryMaxQuoteInput(192.3, 0.52), 100);
  assert.equal(
    quoteToBinaryQuantity(binaryMaxQuoteInput(192.3, 0.52), 0.52),
    192.3,
  );
  assert.equal(binaryMaxQuoteInput(9999.5, 0.01), 99.99);
  assert.ok(
    quoteToBinaryQuantity(binaryMaxQuoteInput(9999.5, 0.01), 0.01) <= 9999.5,
  );
  assert.equal(binaryMaxQuoteInput(200, 0.5), 100);
});

test("split quantity preserves every share and redistributes a dust tail", () => {
  assert.deepEqual(splitBinaryQuantity(10000, 0.5, rules), [10000]);
  assert.deepEqual(splitBinaryQuantity(10000.01, 0.5, rules), [5000.01, 5000]);
  const pieces = splitBinaryQuantity(20000.01, 0.1, rules)!;
  assert.equal(
    pieces.reduce((sum, size) => sum.add(size), new Decimal(0)).toNumber(),
    20000.01,
  );
  assert.ok(
    pieces.every(
      (size) =>
        size <= 10000 &&
        new Decimal(size).div(0.01).isInteger() &&
        new Decimal(size).mul(0.1).gte(5),
    ),
  );
  assert.equal(splitBinaryQuantity(10.001, 0.5, rules), undefined);
  assert.equal(splitBinaryQuantity(49.99, 0.1, rules), undefined);
  assert.deepEqual(splitBinaryQuantity(50, 0.1, rules), [50]);
  assert.equal(splitBinaryQuantity(5.55, 0.9, rules), undefined);
  assert.deepEqual(splitBinaryQuantity(5.56, 0.9, rules), [5.56]);
});

test("MAX spends the full affordable balance and can exceed a child quantity limit", () => {
  assert.equal(
    maxBinaryOrderQuantity({
      snapshot: flat,
      side: OrderSide.BUY,
      upPrice: 0.5,
      balance: 100.06,
    }),
    200,
  );
  const quantity = maxBinaryOrderQuantity({
    snapshot: flat,
    side: OrderSide.BUY,
    upPrice: 0.5,
    balance: 10006,
    splitRules: rules,
  });
  assert.equal(quantity, 20000);
  assert.deepEqual(splitBinaryQuantity(quantity, 0.5, rules), [10000, 10000]);
  assert.equal(
    estimateBinaryOrderFrozen(
      flat,
      OrderSide.BUY,
      0.5,
      quantity,
      [10000, 10000],
    )!.toNumber(),
    10006,
  );
  assert.ok(
    estimateBinaryOrderFrozen(flat, OrderSide.BUY, 0.5, quantity + 0.01)!.gt(
      10006,
    ),
  );
});

test("split closing children share one closing budget and round opening freezes individually", () => {
  const long = { ...flat, positionQty: 10000 };
  assert.equal(
    estimateBinaryOrderFrozen(
      long,
      OrderSide.SELL,
      0.5,
      20000,
      [10000, 10000],
    )!.toNumber(),
    5003,
  );
  assert.equal(
    estimateBinaryOrderFrozen(
      flat,
      OrderSide.BUY,
      0.3333333,
      0.02,
      [0.01, 0.01],
    )!.toNumber(),
    0.006672,
  );
});

test("fee configuration accepts zero and refuses missing, negative, non-finite values", () => {
  assert.ok(validBinaryFee(0));
  assert.ok(validBinaryFee(6));
  for (const fee of [undefined, null, -1, NaN, Infinity, "0"])
    assert.equal(validBinaryFee(fee), false);
});

const orders = (count: number) =>
  Array.from({ length: count }, (_, id) => ({
    client_order_id: id,
    order_quantity: "10",
    margin_mode: "ISOLATED",
  }));
test("batches submit sequentially in groups of twenty with one final single order", async () => {
  const sizes: number[] = [];
  const result = await submitBinaryBatches(orders(41), async (batch) => {
    sizes.push(batch.length);
    return {
      success: true,
      data: {
        rows: batch.map((_, i) => ({ order_id: sizes.length * 100 + i })),
      },
    };
  });
  assert.deepEqual(sizes, [20, 20, 1]);
  assert.deepEqual(result, { accepted: 41, failed: 0, unknown: 0, unsent: 0 });
});

test("partial acceptance stops remaining batches without retrying accepted children", async () => {
  let calls = 0;
  const result = await submitBinaryBatches(orders(25), async () => {
    calls++;
    return {
      success: true,
      data: {
        rows: [
          { order_id: 1 },
          ...Array.from({ length: 19 }, () => ({
            success: false,
            message: "ROUND_CLOSED",
          })),
        ],
      },
    };
  });
  assert.equal(calls, 1);
  assert.equal(result.accepted, 1);
  assert.equal(result.failed, 19);
  assert.equal(result.unsent, 5);
  assert.equal(result.unknown, 0);
});

test("network ambiguity, empty success and root rejection never report full success", async () => {
  const network = await submitBinaryBatches(orders(25), async () => {
    throw new Error("timeout");
  });
  assert.equal(network.unknown, 20);
  assert.equal(network.unsent, 5);
  assert.equal(network.accepted, 0);
  const empty = await submitBinaryBatches(orders(1), async () => ({
    success: true,
    data: {},
  }));
  assert.equal(empty.unknown, 1);
  const rejected = await submitBinaryBatches(orders(25), async () => ({
    success: false,
    message: "ROUND_CLOSED",
  }));
  assert.equal(rejected.failed, 20);
  assert.equal(rejected.unsent, 5);
  assert.equal(rejected.unknown, 0);
});

test("a changed round or account gate stops later batches", async () => {
  let allowed = true;
  const result = await submitBinaryBatches(
    orders(21),
    async (batch) => {
      allowed = false;
      return {
        success: true,
        data: { rows: batch.map((_, i) => ({ order_id: i + 1 })) },
      };
    },
    () => allowed,
  );
  assert.equal(result.accepted, 20);
  assert.equal(result.unsent, 1);
});

test("an explicit API rejection preserves its error and counts failed children", async () => {
  const error = new Error("ROUND_CLOSED");
  error.name = "ApiError";
  const result = await submitBinaryBatches(orders(25), async () => {
    throw error;
  });
  assert.equal(result.failed, 20);
  assert.equal(result.unknown, 0);
  assert.equal(result.unsent, 5);
  assert.equal(result.error, error);
});

test("Sell explicit rejection preserves backend text and uses Sell fallback only for missing details", async () => {
  const fallback = "prediction.message.sellFailed";
  for (const message of [
    "Insufficient available quantity.",
    "Unable to sell position. Backend detail.",
    "  Backend detail  ",
  ]) {
    const result = await submitBinaryBatches(orders(1), async () => ({
      success: false,
      message,
    }));
    assert.equal(binaryRejectionNotice(result.error, fallback), message);
    assert.equal(result.failed, 1);
    assert.equal(result.accepted, 0);
    assert.equal(result.unknown, 0);
  }
  for (const message of [undefined, "", "   "]) {
    const result = await submitBinaryBatches(orders(1), async () => ({
      success: false,
      message,
    }));
    assert.equal(binaryRejectionNotice(result.error, fallback), fallback);
    assert.equal(
      binaryRejectionNotice(result.error),
      "prediction.message.orderFailed",
    );
  }
  const child = await submitBinaryBatches(orders(1), async () => ({
    success: false,
    message: "  ",
    data: { rows: [{ success: false, message: "Backend child detail" }] },
  }));
  assert.equal(
    binaryRejectionNotice(child.error, fallback),
    "Backend child detail",
  );
});

test("batch and unknown notices retain status without exposing fallback keys or claiming ambiguous Sell failure", () => {
  const context = {
    batched: false,
    fallback: "Unable to sell position.",
    batchSummary: "1 accepted, 1 failed",
    unknownSummary: "Acceptance unknown",
  };
  const result = {
    accepted: 0,
    failed: 1,
    unknown: 0,
    unsent: 0,
    error: new Error("Backend detail"),
  };
  assert.equal(binarySubmissionNotice(result, context), "Backend detail");
  assert.equal(
    binarySubmissionNotice({ ...result, error: new Error("") }, context),
    context.fallback,
  );
  assert.equal(
    binarySubmissionNotice(
      { ...result, accepted: 1 },
      { ...context, batched: true },
    ),
    "1 accepted, 1 failed Backend detail",
  );
  assert.equal(
    binarySubmissionNotice(
      { ...result, accepted: 1, error: new Error("") },
      { ...context, batched: true },
    ),
    "1 accepted, 1 failed Unable to sell position.",
  );
  assert.equal(
    binarySubmissionNotice(
      { ...result, failed: 0, unknown: 1, error: new Error("") },
      context,
    ),
    "Acceptance unknown",
  );
});

test("resolveBinaryOrderLimits fills every sparse field from shared defaults", () => {
  assert.deepEqual(resolveBinaryOrderLimits({}), {
    quoteTick: 0.01,
    quoteMin: 0.01,
    quoteMax: 0.99,
    baseTick: 0.01,
    baseMin: 0.01,
    baseMax: 10000,
    minNotional: 5,
  });
  // quote_max falls back to 1 - quote_tick so non-default grids stay symmetric.
  assert.deepEqual(resolveBinaryOrderLimits({ quote_tick: 0.02 }), {
    quoteTick: 0.02,
    quoteMin: 0.02,
    quoteMax: 0.98,
    baseTick: 0.01,
    baseMin: 0.01,
    baseMax: 10000,
    minNotional: 5,
  });
  assert.deepEqual(
    resolveBinaryOrderLimits({
      quote_min: 0.1,
      quote_max: 0.9,
      quote_tick: 0.05,
      base_min: 1,
      base_max: 50,
      base_tick: 0.5,
      min_notional: 10,
    }),
    {
      quoteTick: 0.05,
      quoteMin: 0.1,
      quoteMax: 0.9,
      baseTick: 0.5,
      baseMin: 1,
      baseMax: 50,
      minNotional: 10,
    },
  );
});

test("validateBinaryOrderSize reports the first failing size rule in UP coordinates", () => {
  const limits = resolveBinaryOrderLimits(rules);
  // 6 contracts at 0.99 has notional 5.94 >= 5.
  assert.equal(
    validateBinaryOrderSize({ price: 0.99, quantity: 6, limits }),
    undefined,
  );
  assert.equal(
    validateBinaryOrderSize({ price: 0.009, quantity: 6, limits }),
    "priceOutOfRange",
  );
  assert.equal(
    validateBinaryOrderSize({ price: 1, quantity: 6, limits }),
    "priceOutOfRange",
  );
  assert.equal(
    validateBinaryOrderSize({ price: Number.NaN, quantity: 6, limits }),
    "priceOutOfRange",
  );
  assert.equal(
    validateBinaryOrderSize({ price: 0.555, quantity: 6, limits }),
    "priceNotTickAligned",
  );
  // Market orders ride the tick-aligned protection price; callers opt out.
  assert.equal(
    validateBinaryOrderSize({
      price: 0.555,
      quantity: 10,
      limits,
      requirePriceTickAligned: false,
    }),
    undefined,
  );
  assert.equal(
    validateBinaryOrderSize({ price: 0.5, quantity: 0.009, limits }),
    "quantityBelowMin",
  );
  assert.equal(
    validateBinaryOrderSize({ price: 0.5, quantity: Number.NaN, limits }),
    "quantityBelowMin",
  );
  // 6 * 0.5 = 3 < 5.
  assert.equal(
    validateBinaryOrderSize({ price: 0.5, quantity: 6, limits }),
    "notionalBelowMin",
  );
  assert.equal(
    validateBinaryOrderSize({
      price: 0.5,
      quantity: 10001,
      limits,
      checkQuantityMax: true,
    }),
    "quantityAboveMax",
  );
  assert.equal(
    validateBinaryOrderSize({
      price: 0.5,
      quantity: 10001,
      limits,
      requireQuantityTickAligned: true,
    }),
    undefined,
  );
  assert.equal(
    validateBinaryOrderSize({
      price: 0.5,
      quantity: 6.005,
      limits,
      requireQuantityTickAligned: true,
    }),
    "quantityNotTickAligned",
  );
});

test("binaryUpNotional converts DOWN display prices to the UP complement", () => {
  assert.equal(binaryUpNotional(10, "up", 0.3).toNumber(), 3);
  // DOWN @0.3 is UP @0.7: 10 * 0.7 = 7.
  assert.equal(binaryUpNotional(10, "down", 0.3).toNumber(), 7);
  assert.ok(binaryUpNotional(6, "down", 0.98) instanceof Decimal);
});
