import assert from "node:assert/strict";
import test from "node:test";
import {
  binaryOutcomeMarkPrice,
  subscribeBinaryMarkPrice,
} from "./binaryMarkPrice";

test("mark prices retain zero/one and use exact outcome complements", () => {
  assert.equal(binaryOutcomeMarkPrice(0, "up"), 0);
  assert.equal(binaryOutcomeMarkPrice(0, "down"), 1);
  assert.equal(binaryOutcomeMarkPrice(1, "down"), 0);
  assert.equal(binaryOutcomeMarkPrice(0.63, "up"), 0.63);
  assert.equal(binaryOutcomeMarkPrice(0.63, "down"), 0.37);
  for (const price of [undefined, NaN, Infinity, -0.01, 1.01]) {
    assert.equal(binaryOutcomeMarkPrice(price, "up"), undefined);
    assert.equal(binaryOutcomeMarkPrice(price, "down"), undefined);
  }
});

test("round subscription rejects invalid and late messages across round changes", () => {
  const callbacks = new Map<string, (message: any) => void>();
  const unsubscribed: string[] = [];
  const stream = {
    subscribe(topic: string, handlers: any) {
      callbacks.set(topic, handlers.onMessage);
      const envelope = { data: { symbol: "A", price: 0 } };
      assert.equal(handlers.formatter(envelope), envelope);
      return () => {
        unsubscribed.push(topic);
      };
    },
  };
  const prices: number[] = [];
  const stopA = subscribeBinaryMarkPrice(stream, "A", (price) =>
    prices.push(price),
  );
  const emitA = callbacks.get("A@markprice")!;
  emitA({ data: { symbol: "A", price: 0 } });
  emitA({ data: { symbol: "A", price: 1 } });
  emitA({ data: { price: 0.4 } });
  for (const price of [-1, 2, NaN, Infinity, undefined, "0.5"]) {
    emitA({ data: { symbol: "A", price } });
  }
  emitA({});
  emitA({ data: { symbol: "B", price: 0.7 } });
  assert.deepEqual(prices, [0, 1, 0.4]);
  stopA();
  const stopB = subscribeBinaryMarkPrice(stream, "B", (price) =>
    prices.push(price),
  );
  emitA({ data: { symbol: "A", price: 0.8 } });
  callbacks.get("B@markprice")!({ data: { symbol: "B", price: 0.6 } });
  assert.deepEqual(prices, [0, 1, 0.4, 0.6]);
  stopB();
  assert.deepEqual(unsubscribed, ["A@markprice", "B@markprice"]);
});
