import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import {
  SWRConfig,
  useSWRConfig,
  type Cache,
  type SWRConfiguration,
} from "swr";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  BINARY_INFO_QUERY_KEY,
  toBinarySymbolsInfo,
  useBinaryInfoObserver,
} from "@orderly.network/hooks/src/orderly/binaryInfo";
import { useQuery } from "@orderly.network/hooks/src/useQuery";
import type { API } from "@orderly.network/types";

const mocks = vi.hoisted(() => ({
  fetcher: vi.fn<() => Promise<API.BinaryInfoRow[] | null>>(),
  setBinarySymbolsInfo: vi.fn<(info: Record<string, API.SymbolExt>) => void>(),
  requesterSuccess: vi.fn(),
  info: {} as Record<string, API.SymbolExt>,
}));

// Keep the real useQuery and SWR; mock only their external dependencies.
vi.mock("@orderly.network/hooks/src/useConfig", () => ({
  useConfig: () => "https://api.example.test",
}));
vi.mock("@orderly.network/plugin-core", () => ({
  usePluginScope: () => undefined,
}));
vi.mock("@orderly.network/hooks/src/utils/fetcher", () => ({
  fetcher: mocks.fetcher,
}));
vi.mock("@orderly.network/hooks/src/orderly/appStore", () => ({
  useAppStore: (
    selector: (state: {
      actions: { setBinarySymbolsInfo: typeof mocks.setBinarySymbolsInfo };
    }) => unknown,
  ) =>
    selector({ actions: { setBinarySymbolsInfo: mocks.setBinarySymbolsInfo } }),
}));

const row: API.BinaryInfoRow = {
  symbol: "PERP_BTC5M2609290800_USDC",
  status: "ACTIVE",
  product_type: "BINARY",
  activated_at: 1790664260085,
  observation_start_at: 1790668800000,
  expire_at: 1790669100000,
  s0: null,
  index_price_symbol: "PERP_BTC_USDC",
  fee_model: "BINARY_PROBABILITY",
  quote_tick: 0.01,
  base_tick: 0.01,
  imr_factor: 0.000000091,
};
const updatedRow = { ...row, quote_tick: 0.001 };

let root: ReactTestRenderer | undefined;
let config: SWRConfiguration & { provider: () => Cache };
let cache: Cache;
let mutate: ReturnType<typeof useSWRConfig>["mutate"];
let requesterData: API.BinaryInfoRow[] | undefined;

type HarnessProps = {
  enabled?: boolean;
  requester?: boolean;
  renderVersion?: number;
};

function Harness({ enabled = true, requester = false }: HarnessProps) {
  const { mutate: cacheMutate } = useSWRConfig();
  // This consumer owns the request before the observer subscribes to its key.
  const { data } = useQuery<API.BinaryInfoRow[]>(
    requester ? BINARY_INFO_QUERY_KEY : null,
    { onSuccess: mocks.requesterSuccess },
  );
  useBinaryInfoObserver(enabled);
  React.useEffect(() => {
    mutate = cacheMutate;
    requesterData = data;
  }, [cacheMutate, data]);
  return null;
}

function tree(props: HarnessProps) {
  return (
    <SWRConfig value={config}>
      <Harness {...props} />
    </SWRConfig>
  );
}

async function mount(props: HarnessProps = {}) {
  await act(async () => {
    root = create(tree(props));
  });
}

async function update(props: HarnessProps = {}) {
  await act(async () => {
    root!.update(tree(props));
  });
}

async function updateCache(rows: API.BinaryInfoRow[] | null) {
  await act(async () => {
    await mutate(BINARY_INFO_QUERY_KEY, rows, { revalidate: false });
  });
}

beforeEach(() => {
  cache = new Map();
  config = { provider: () => cache, shouldRetryOnError: false };
  mocks.fetcher.mockReset().mockResolvedValue([row]);
  mocks.requesterSuccess.mockClear();
  mocks.info = toBinarySymbolsInfo([row]);
  mocks.setBinarySymbolsInfo.mockReset().mockImplementation((info) => {
    mocks.info = info;
  });
  requesterData = undefined;
});

afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
});

describe("Binary info observer query synchronization", () => {
  it("synchronizes when another consumer owns the deduplicated request", async () => {
    mocks.fetcher.mockResolvedValue([updatedRow]);
    await mount({ requester: true });

    expect(mocks.fetcher).toHaveBeenCalledTimes(1);
    expect(mocks.requesterSuccess).toHaveBeenCalledTimes(1);
    expect(requesterData).toEqual([updatedRow]);
    expect(mocks.setBinarySymbolsInfo).toHaveBeenCalledTimes(1);
    expect(mocks.info[row.symbol].quote_dp).toBe(3);
  });

  it("synchronizes a warm cache and subsequent cache updates without requests", async () => {
    cache.set(BINARY_INFO_QUERY_KEY, { data: [row] });
    config.revalidateOnMount = false;
    await mount();

    expect(mocks.setBinarySymbolsInfo).toHaveBeenCalledTimes(1);
    expect(mocks.info[row.symbol].quote_dp).toBe(2);
    await updateCache([updatedRow]);
    expect(mocks.setBinarySymbolsInfo).toHaveBeenCalledTimes(2);
    expect(mocks.info[row.symbol].quote_dp).toBe(3);
    expect(mocks.fetcher).not.toHaveBeenCalled();
  });

  it("clears the previous configuration when the snapshot becomes empty", async () => {
    await mount();
    await updateCache([]);

    expect(mocks.setBinarySymbolsInfo).toHaveBeenLastCalledWith({});
    expect(mocks.info).toEqual({});
  });

  it("preserves configuration while disabled and synchronizes on re-enable", async () => {
    cache.set(BINARY_INFO_QUERY_KEY, { data: [updatedRow] });
    config.revalidateOnMount = false;
    config.revalidateIfStale = false;
    await mount({ enabled: false });

    expect(mocks.setBinarySymbolsInfo).not.toHaveBeenCalled();
    expect(mocks.info[row.symbol].quote_dp).toBe(2);
    await update({ enabled: true });
    expect(mocks.info[row.symbol].quote_dp).toBe(3);
    mocks.setBinarySymbolsInfo.mockClear();

    await update({ enabled: false });
    await updateCache([]);
    expect(mocks.setBinarySymbolsInfo).not.toHaveBeenCalled();
    expect(mocks.info[row.symbol].quote_dp).toBe(3);
    await update({ enabled: true });
    expect(mocks.setBinarySymbolsInfo).toHaveBeenLastCalledWith({});
    expect(mocks.info).toEqual({});
    expect(mocks.fetcher).not.toHaveBeenCalled();
  });

  it("does not write configuration again on unrelated renders", async () => {
    await mount();
    expect(mocks.setBinarySymbolsInfo).toHaveBeenCalledTimes(1);
    await update({ renderVersion: 1 });
    await update({ renderVersion: 2 });

    expect(mocks.setBinarySymbolsInfo).toHaveBeenCalledTimes(1);
    expect(mocks.fetcher).toHaveBeenCalledTimes(1);
  });

  it("retains the previous configuration when query data is missing", async () => {
    config.revalidateOnMount = false;
    const previousInfo = mocks.info;
    await mount();

    expect(mocks.setBinarySymbolsInfo).not.toHaveBeenCalled();
    expect(mocks.info).toBe(previousInfo);
  });

  it("retains the previous configuration when a request fails", async () => {
    mocks.fetcher.mockRejectedValue(new Error("Binary endpoint unavailable"));
    const previousInfo = mocks.info;
    await mount();

    expect(mocks.fetcher).toHaveBeenCalledTimes(1);
    expect(mocks.setBinarySymbolsInfo).not.toHaveBeenCalled();
    expect(mocks.info).toBe(previousInfo);
  });

  it("retains the last valid configuration on failed revalidation or null data", async () => {
    await mount();
    const previousInfo = mocks.info;
    mocks.setBinarySymbolsInfo.mockClear();
    mocks.fetcher.mockRejectedValue(new Error("Binary endpoint unavailable"));
    await act(async () => {
      await mutate(BINARY_INFO_QUERY_KEY);
    });
    await updateCache(null);

    expect(mocks.fetcher).toHaveBeenCalledTimes(2);
    expect(mocks.setBinarySymbolsInfo).not.toHaveBeenCalled();
    expect(mocks.info).toBe(previousInfo);
  });
});
