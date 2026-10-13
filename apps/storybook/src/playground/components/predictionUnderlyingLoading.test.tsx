// @vitest-environment jsdom
import { useEffect } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  useBinaryUnderlying,
  type UseBinaryUnderlyingArgs,
} from "@orderly.network/prediction/src/prediction/binary/useBinaryUnderlying";

const mocks = vi.hoisted(() => ({
  apiBaseUrl: "https://qa.example",
  fetcher: vi.fn(),
  ws: {
    subscribe: vi.fn<
      (
        topic: string,
        handlers: {
          onMessage: (message: {
            ts: number;
            data: { symbol: string; price: number };
          }) => void;
        },
      ) => () => void
    >(() => () => {}),
  },
}));
vi.mock("@orderly.network/hooks", () => ({
  fetcher: mocks.fetcher,
  useConfig: () => mocks.apiBaseUrl,
  useWS: () => mocks.ws,
}));
vi.mock("@orderly.network/utils", () => ({ getTimestamp: () => Date.now() }));
const now = Date.UTC(2026, 9, 13, 12);
const args: UseBinaryUnderlyingArgs = {
  active: true,
  indexSymbol: "PERP_BTC_USDC",
  roundStartSec: (now - 60_000) / 1000,
  expireAtMs: now + 240_000,
};
let state: ReturnType<typeof useBinaryUnderlying>;
let root: ReactTestRenderer;
const renders: string[] = [];
function Probe(props: UseBinaryUnderlyingArgs) {
  const value = useBinaryUnderlying(props);
  useEffect(() => {
    state = value;
    renders.push(value.historyStatus);
  });
  return null;
}
async function render(patch: Partial<UseBinaryUnderlyingArgs> = {}) {
  await act(async () => {
    const element = <Probe {...args} {...patch} />;
    if (root) root.update(element);
    else root = create(element);
  });
}
function deferred() {
  let resolve!: (rows: { timestamp: number; index_price: number }[]) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<{ timestamp: number; index_price: number }[]>(
    (done, fail) => {
      resolve = done;
      reject = fail;
    },
  );
  return { promise, resolve, reject };
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
  mocks.apiBaseUrl = "https://qa.example";
  mocks.fetcher.mockReset().mockResolvedValue([]);
  mocks.ws.subscribe.mockClear();
  renders.length = 0;
});
afterEach(() => {
  act(() => root?.unmount());
  root = undefined!;
  vi.useRealTimers();
});
it("reports loading on the first render and waits for every history chunk", async () => {
  const last = deferred();
  for (let index = 0; index < 7; index++)
    mocks.fetcher.mockResolvedValueOnce([]);
  mocks.fetcher.mockReturnValueOnce(last.promise);
  await render();
  expect(renders[0]).toBe("loading");
  expect(mocks.fetcher).toHaveBeenCalledTimes(8);
  expect(state.historyStatus).toBe("loading");
  await act(async () => last.resolve([]));
  expect(state.historyStatus).toBe("ready");
  expect(state.candles).toEqual([]);
});
it("rapid A/B/C changes ignore late old results and clear readiness in the first new render", async () => {
  await render();
  expect(state.historyStatus).toBe("ready");
  const b = deferred();
  const c = deferred();
  mocks.fetcher.mockReturnValueOnce(b.promise);
  renders.length = 0;
  await render({
    roundStartSec: args.roundStartSec! - 300,
    expireAtMs: now - 60_000,
  });
  expect(renders[0]).toBe("loading");
  mocks.fetcher.mockReturnValueOnce(c.promise);
  await render({
    roundStartSec: args.roundStartSec! - 600,
    expireAtMs: now - 360_000,
  });
  await act(async () =>
    b.resolve([{ timestamp: now - 300_000, index_price: 111 }]),
  );
  expect(state.historyStatus).toBe("loading");
  expect(state.priceHistory).toEqual([]);
  await act(async () =>
    c.resolve([{ timestamp: now - 400_000, index_price: 222 }]),
  );
  expect(state.historyStatus).toBe("ready");
  expect(state.priceHistory.map((point) => point.price)).toEqual([222]);
});
it("shows initial failure, recovers on retry, and keeps ready data during final-phase failure", async () => {
  mocks.fetcher.mockRejectedValueOnce(new Error("Offline"));
  await render();
  expect(state.historyStatus).toBe("error");
  await act(async () => {
    await vi.advanceTimersByTimeAsync(5000);
  });
  expect(state.historyStatus).toBe("ready");
  mocks.fetcher.mockRejectedValueOnce(new Error("Final phase offline"));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(235000);
  });
  expect(state.historyStatus).toBe("ready");
});
it("source changes reset readiness and disabling the loader yields idle", async () => {
  await render();
  expect(state.historyStatus).toBe("ready");
  mocks.apiBaseUrl = "https://prod.example";
  const request = deferred();
  mocks.fetcher.mockReturnValueOnce(request.promise);
  renders.length = 0;
  await render();
  expect(renders[0]).toBe("loading");
  await render({ active: false });
  expect(state.historyStatus).toBe("idle");
  await act(async () => request.resolve([]));
  expect(state.historyStatus).toBe("idle");
  await render({ roundStartSec: undefined });
  expect(state.historyStatus).toBe("idle");
});

it("keeps empty history candles empty despite live ticks and restores them after nonempty history arrives", async () => {
  const initial = deferred();
  mocks.fetcher.mockReturnValueOnce(initial.promise);
  await render();
  const handlers = mocks.ws.subscribe.mock.calls.at(-1)![1];
  const emit = async (timestamp: number, price: number) => {
    await act(async () =>
      handlers.onMessage({
        ts: timestamp,
        data: { symbol: "SPOT_BTC_USDC", price },
      }),
    );
  };
  await emit(now, 83500);
  await emit(now + 1000, 83510);
  expect(state.priceHistory).toHaveLength(2);
  expect(state.chartIndexPrice).toBe(83510);
  await act(async () => initial.resolve([]));
  expect(state.historyStatus).toBe("ready");
  expect(state.candles).toEqual([]);
  expect(state.priceHistory).toHaveLength(2);
  await emit(now + 2000, 83520);
  expect(state.candles).toEqual([]);
  expect(state.chartIndexPrice).toBe(83520);
  mocks.fetcher.mockResolvedValueOnce([
    { timestamp: now - 60000, index_price: 83400 },
  ]);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(240000);
  });
  expect(state.historyStatus).toBe("ready");
  expect(state.candles).toHaveLength(2);
  expect(state.candles.at(-1)?.close).toBe(83520);
});
