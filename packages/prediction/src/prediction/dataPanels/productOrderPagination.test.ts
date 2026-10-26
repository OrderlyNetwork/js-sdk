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

test("filtered orders automatically fill pages across sparse and empty batches", () => {
  const orders = Array.from({ length: 451 }, (_, id) => ({
    id,
    outcome: id >= 100 && id % 7 === 0 ? "tie" : "up",
  }));
  let loaded = 50;
  const visited = new Set<number>();
  const matches = () =>
    orders.slice(0, loaded).filter((order) => order.outcome === "tie");
  for (let page = 1; ; page++) {
    while (
      shouldLoadMoreProductOrders({
        loaded: matches().length,
        page,
        hasMore: loaded < orders.length,
        isValidating: false,
      })
    ) {
      loaded = Math.min(loaded + 50, orders.length);
    }
    if (page === 1) {
      assert.ok(matches().length > 20);
      assert.ok(
        loaded < orders.length,
        "stop after finding the next page, rather than fetching everything",
      );
    }
    const rows = matches();
    rows
      .slice((page - 1) * 20, page * 20)
      .forEach((row) => visited.add(row.id));
    if (page * 20 >= rows.length) break;
  }
  assert.deepEqual(
    [...visited],
    orders.filter((order) => order.outcome === "tie").map((order) => order.id),
  );
});

test("a filter with no matches stops when the source is exhausted", () => {
  let loaded = 50;
  let requests = 0;
  while (
    shouldLoadMoreProductOrders({
      loaded: 0,
      page: 1,
      hasMore: loaded < 151,
      isValidating: false,
    })
  ) {
    loaded = Math.min(loaded + 50, 151);
    requests++;
  }
  assert.equal(requests, 3);
});
