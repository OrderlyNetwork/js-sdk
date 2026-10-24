// @vitest-environment jsdom
import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import useSWR, { SWRConfig, useSWRConfig } from "swr";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { BinaryInfoDetail } from "@orderly.network/prediction/src/prediction/binary/binaryInfo";
import { useBinaryRounds } from "@orderly.network/prediction/src/prediction/binary/useBinaryRounds";
import { PredictionWidget } from "@orderly.network/prediction/src/prediction/prediction.widget";

const mocks = vi.hoisted(() => ({ select: vi.fn() }));
vi.mock("@orderly.network/hooks", () => ({
  useSWRConfig,
  useQuery: (key: string | null, options: object) => useSWR(key, options),
  useLocalStorage: (_key: string, initial: unknown) => useState(initial),
}));
vi.mock("@orderly.network/utils", async () => ({
  ...(await vi.importActual("@orderly.network/utils")),
  getTimestamp: () => Date.now(),
}));
vi.mock("@orderly.network/react-app", () => ({
  useFeatureEnabled: () => true,
  useAppContext: () => ({}),
  useCanTrade: () => false,
}));
vi.mock("@orderly.network/ui-assets", () => ({
  AssetViewWidget: () => null,
  useFirstTimeDeposit: () => false,
}));
vi.mock("@orderly.network/prediction/src/prediction/prediction.ui", () => ({
  Prediction: ({ isRoundsLoading }: { isRoundsLoading: boolean }) => (
    <div>{isRoundsLoading ? "loading" : "ready"}</div>
  ),
}));
vi.mock("@orderly.network/prediction/src/prediction/prediction.script", () => ({
  usePredictionScript: (
    _restricted: boolean,
    _active: boolean,
    _live: boolean,
    selection: { symbol?: string; onSymbolSelect: (symbol: string) => void },
  ) => {
    const rounds = useBinaryRounds({ active: true, ...selection });
    return {
      rounds,
      ...rounds,
      isRoundsReady: !!rounds.selectedRow || rounds.isMissingHistoricalRound,
      isRoundsLoading: rounds.isLoading,
    };
  },
}));

const T0 = Date.UTC(2026, 9, 13, 1, 45);
const live: BinaryInfoDetail = {
  symbol: "PERP_BTC5M2610130145_USDC",
  product_type: "BINARY",
  fee_model: "BINARY_PROBABILITY",
  status: "ACTIVE",
  activated_at: T0 - 60_000,
  observation_start_at: T0,
  expire_at: T0 + 300_000,
  index_price_symbol: "PERP_BTC_USDC",
  s0: 100,
};
const history: BinaryInfoDetail = {
  ...live,
  symbol: "PERP_BTC5M2610120145_USDC",
  observation_start_at: T0 - 86_400_000,
  expire_at: T0 - 86_100_000,
};
const future: BinaryInfoDetail = {
  ...live,
  symbol: "PERP_BTC5M2610130150_USDC",
  observation_start_at: T0 + 300_000,
  expire_at: T0 + 600_000,
};
const expired: BinaryInfoDetail = {
  ...live,
  symbol: "PERP_BTC5M2610130140_USDC",
  observation_start_at: T0 - 300_000,
  expire_at: T0,
  status: "DELISTED",
};
const INFO_KEY = "/v1/public/binary/info";
const DETAIL_KEY = `${INFO_KEY}/${history.symbol}`;
let detailRequest: () => Promise<BinaryInfoDetail>;
let snapshotRows: BinaryInfoDetail[];
const fetcher = vi.fn((key: string) =>
  key === INFO_KEY ? Promise.resolve(snapshotRows) : detailRequest(),
);
let cache = new Map();
let root: ReturnType<typeof createRoot>;
let container: HTMLDivElement;
let refresh: ReturnType<typeof useSWRConfig>["mutate"];
async function render(symbol: string, mounted = true, observer = false) {
  await act(async () => {
    root.render(
      <SWRConfig
        value={{
          provider: () => cache,
          fetcher,
          revalidateOnFocus: false,
        }}
      >
        {observer && <DetailObserver />}
        {mounted && (
          <PredictionWidget symbol={symbol} onSymbolChange={mocks.select} />
        )}
      </SWRConfig>,
    );
  });
}
async function renderWidgets(
  symbol: string,
  selections: ((selection: { symbol: string }) => void)[],
) {
  await act(async () => {
    root.render(
      <SWRConfig
        value={{ provider: () => cache, fetcher, revalidateOnFocus: false }}
      >
        <QueryControls />
        {selections.map((select, index) => (
          <PredictionWidget
            key={index}
            symbol={symbol}
            onSymbolChange={select}
          />
        ))}
      </SWRConfig>,
    );
  });
}
function QueryControls() {
  refresh = useSWRConfig().mutate;
  return null;
}
function DetailObserver() {
  useSWR(DETAIL_KEY, { shouldRetryOnError: false });
  return null;
}
function deferred() {
  let resolve!: (value: BinaryInfoDetail) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<BinaryInfoDetail>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
beforeEach(() => {
  (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
  vi.useFakeTimers();
  vi.setSystemTime(T0 + 34_000);
  vi.clearAllMocks();
  snapshotRows = [live];
  cache = new Map([[INFO_KEY, { data: [live], isLoading: false }]]);
  detailRequest = () => Promise.reject(new Error("Network request failed"));
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
});

it.each([true, false])(
  "does not retry missing details while awaiting fallback acceptance or without a candidate (hasCandidate=%s)",
  async (hasCandidate) => {
    snapshotRows = hasCandidate ? [live] : [];
    cache.set(INFO_KEY, { data: snapshotRows, isLoading: false });
    await render(history.symbol);
    expect(mocks.select).toHaveBeenCalledTimes(hasCandidate ? 1 : 0);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(31_000);
    });
    expect(
      fetcher.mock.calls.filter(([key]) => key === DETAIL_KEY),
    ).toHaveLength(1);
    expect(mocks.select).toHaveBeenCalledTimes(hasCandidate ? 1 : 0);
  },
);

it.each(
  [live, future, expired].flatMap((target) =>
    [false, true].map((remount) => ({ target, remount })),
  ),
)(
  "waits for a fresh successful request after failure and leaving (target=$target.symbol, remount=$remount)",
  async ({ target, remount }) => {
    snapshotRows = [target];
    cache.set(INFO_KEY, { data: snapshotRows, isLoading: false });
    await render(history.symbol);
    expect(mocks.select).toHaveBeenCalledExactlyOnceWith({
      symbol: target.symbol,
    });
    await render(target.symbol, !remount);
    const next = deferred();
    detailRequest = () => next.promise;
    mocks.select.mockClear();
    await render(history.symbol);
    expect(
      fetcher.mock.calls.filter(([key]) => key === DETAIL_KEY),
    ).toHaveLength(2);
    expect(mocks.select).not.toHaveBeenCalled();
    expect(container.textContent).toBe("loading");
    await act(async () => next.resolve(history));
    expect(mocks.select).not.toHaveBeenCalled();
    expect(container.textContent).toBe("ready");
  },
);

it("only falls back after the new request fails, even if it reuses the cached Error", async () => {
  const error = new Error("Network request failed");
  detailRequest = () => Promise.reject(error);
  await render(history.symbol);
  await render(live.symbol);
  const next = deferred();
  detailRequest = () => next.promise;
  mocks.select.mockClear();
  await render(history.symbol);
  expect(mocks.select).not.toHaveBeenCalled();
  await act(async () => next.reject(error));
  expect(mocks.select).toHaveBeenCalledExactlyOnceWith({ symbol: live.symbol });
  expect(container.textContent).toBe("loading");
});

it("also observes a fresh failure when another consumer owns the deduplicated request", async () => {
  const next = deferred();
  detailRequest = () => next.promise;
  await render(live.symbol, true, true);
  await render(history.symbol, true, true);
  expect(fetcher.mock.calls.filter(([key]) => key === DETAIL_KEY)).toHaveLength(
    1,
  );
  expect(mocks.select).not.toHaveBeenCalled();
  await act(async () => next.reject(new Error("Network request failed")));
  expect(mocks.select).toHaveBeenCalledExactlyOnceWith({ symbol: live.symbol });
});

it("observes a shared request failure after the original widget unmounts", async () => {
  const next = deferred();
  detailRequest = () => next.promise;
  await render(history.symbol);
  await render(live.symbol, false);
  await render(history.symbol);
  expect(fetcher.mock.calls.filter(([key]) => key === DETAIL_KEY)).toHaveLength(
    1,
  );
  expect(mocks.select).not.toHaveBeenCalled();
  await act(async () => next.reject(new Error("Network request failed")));
  expect(mocks.select).toHaveBeenCalledExactlyOnceWith({ symbol: live.symbol });
});

it("does not fall back when a late failure belongs to a selection that was left", async () => {
  const next = deferred();
  detailRequest = () => next.promise;
  await render(history.symbol);
  await render(live.symbol);
  await act(async () => next.reject(new Error("Network request failed")));
  expect(mocks.select).not.toHaveBeenCalled();
  expect(container.textContent).toBe("ready");
});

it.each([history, future])(
  "uses a shared cached failure without waiting for a request that will not start: $symbol",
  async (requested) => {
    const key = `${INFO_KEY}/${requested.symbol}`;
    const first = vi.fn();
    const second = vi.fn();
    await renderWidgets(requested.symbol, [first]);
    expect(first).toHaveBeenCalledExactlyOnceWith({ symbol: live.symbol });
    first.mockClear();
    await renderWidgets(requested.symbol, [first, second]);
    expect(fetcher.mock.calls.filter(([url]) => url === key)).toHaveLength(1);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledExactlyOnceWith({ symbol: live.symbol });
    await renderWidgets(requested.symbol, [first, second]);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
    expect(container.textContent).toBe("loadingloading");
  },
);

it.each([true, false])(
  "waits for an active shared refresh despite a cached error (succeeds=%s)",
  async (succeeds) => {
    const key = `${INFO_KEY}/${future.symbol}`;
    const error = new Error("Request failed");
    detailRequest = () => Promise.reject(error);
    const first = vi.fn();
    const second = vi.fn();
    await renderWidgets(future.symbol, [first]);
    first.mockClear();
    const next = deferred();
    detailRequest = () => next.promise;
    act(() => {
      void refresh(key).catch(() => undefined);
    });
    await renderWidgets(future.symbol, [first, second]);
    expect(fetcher.mock.calls.filter(([url]) => url === key)).toHaveLength(2);
    expect(container.textContent).toBe("loadingloading");
    expect(first).not.toHaveBeenCalled();
    expect(second).not.toHaveBeenCalled();
    await act(async () => {
      if (succeeds) next.resolve(future);
      else next.reject(error);
    });
    expect(first).not.toHaveBeenCalled();
    if (succeeds) {
      expect(second).not.toHaveBeenCalled();
      expect(container.textContent).toBe("readyready");
    } else {
      expect(second).toHaveBeenCalledExactlyOnceWith({ symbol: live.symbol });
    }
    await renderWidgets(future.symbol, [first, second]);
    expect(fetcher.mock.calls.filter(([url]) => url === key)).toHaveLength(2);
    expect(second).toHaveBeenCalledTimes(succeeds ? 0 : 1);
  },
);

it.each([true, false])(
  "shares an already pending request between two widgets (succeeds=%s)",
  async (succeeds) => {
    const next = deferred();
    detailRequest = () => next.promise;
    const first = vi.fn();
    const second = vi.fn();
    await renderWidgets(future.symbol, [first]);
    await renderWidgets(future.symbol, [first, second]);
    const requests = () =>
      fetcher.mock.calls.filter(
        ([key]) => key === `${INFO_KEY}/${future.symbol}`,
      );
    expect(requests()).toHaveLength(1);
    expect(first).not.toHaveBeenCalled();
    expect(second).not.toHaveBeenCalled();
    await act(async () => {
      if (succeeds) next.resolve(future);
      else next.reject(new Error("Request failed"));
    });
    for (const select of [first, second]) {
      if (succeeds) expect(select).not.toHaveBeenCalled();
      else
        expect(select).toHaveBeenCalledExactlyOnceWith({ symbol: live.symbol });
    }
    expect(requests()).toHaveLength(1);
  },
);

it.each([true, false])(
  "ignores the shared refresh result after both widgets leave its key (succeeds=%s)",
  async (succeeds) => {
    const first = vi.fn();
    const second = vi.fn();
    await renderWidgets(future.symbol, [first]);
    first.mockClear();
    const next = deferred();
    detailRequest = () => next.promise;
    act(() => {
      void refresh(`${INFO_KEY}/${future.symbol}`).catch(() => undefined);
    });
    await renderWidgets(future.symbol, [first, second]);
    expect(
      fetcher.mock.calls.filter(
        ([key]) => key === `${INFO_KEY}/${future.symbol}`,
      ),
    ).toHaveLength(2);
    await renderWidgets(live.symbol, [first, second]);
    await act(async () => {
      if (succeeds) next.resolve(future);
      else next.reject(new Error("Late request failed"));
    });
    expect(first).not.toHaveBeenCalled();
    expect(second).not.toHaveBeenCalled();
    expect(container.textContent).toBe("readyready");
  },
);
