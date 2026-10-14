import assert from "node:assert/strict";
import test from "node:test";
import { shouldLoadMoreProductOrders } from "./productOrderPagination";

/** Follow only pages exposed by the loaded-row total, as the merged table does. */
function browseOrders(
  perpsCount: number,
  binaryCount: number,
  perpsSize = 50,
  pageSize = 20,
) {
  const streams = [
    { product: "PERP", total: perpsCount, size: perpsSize },
    { product: "BINARY", total: binaryCount, size: 50 },
  ].map((stream, product) => ({
    ...stream,
    loaded: Math.min(stream.total, stream.size),
    orders: Array.from({ length: stream.total }, (_, index) => ({
      id: `${stream.product}:${index}`,
      timestamp: 10000 - index * 2 - product,
    })),
  }));
  const visited = new Set<string>();
  const loadedOrders = () =>
    streams
      .flatMap((stream) => stream.orders.slice(0, stream.loaded))
      .sort((a, b) => b.timestamp - a.timestamp);
  for (
    let page = 1;
    page <= Math.ceil(loadedOrders().length / pageSize);
    page++
  ) {
    for (const stream of streams) {
      while (
        shouldLoadMoreProductOrders({
          loaded: stream.loaded,
          page,
          pageSize,
          hasMore: stream.loaded < stream.total,
          isValidating: false,
        })
      ) {
        stream.loaded = Math.min(stream.loaded + stream.size, stream.total);
      }
    }
    loadedOrders()
      .slice((page - 1) * pageSize, page * pageSize)
      .forEach((order) => visited.add(order.id));
  }
  return visited;
}

test("PERP history continues past 100 loaded rows when Binary is empty", () => {
  const visited = browseOrders(201, 0);
  assert.equal(visited.size, 201);
  assert.ok(visited.has("PERP:200"));
});

test("pending orders continue past the initial 500-row page", () => {
  const visited = browseOrders(501, 0, 500);
  assert.equal(visited.size, 501);
  assert.ok(visited.has("PERP:500"));
});

test("Binary-only and mixed streams keep every remaining order reachable", () => {
  for (const [perps, binary] of [
    [0, 201],
    [121, 201],
  ]) {
    assert.equal(browseOrders(perps, binary).size, perps + binary);
  }
});

test("in-flight or exhausted streams do not request another page", () => {
  assert.equal(
    shouldLoadMoreProductOrders({
      loaded: 100,
      page: 5,
      hasMore: true,
      isValidating: true,
    }),
    false,
  );
  assert.equal(
    shouldLoadMoreProductOrders({
      loaded: 100,
      page: 5,
      hasMore: false,
      isValidating: false,
    }),
    false,
  );
});

test("all orders remain reachable with every supported display page size", () => {
  for (const pageSize of [10, 20, 50, 100]) {
    for (const [perps, binary] of [
      [201, 0],
      [0, 201],
      [121, 201],
    ]) {
      assert.equal(
        browseOrders(perps, binary, 50, pageSize).size,
        perps + binary,
      );
    }
  }
});
