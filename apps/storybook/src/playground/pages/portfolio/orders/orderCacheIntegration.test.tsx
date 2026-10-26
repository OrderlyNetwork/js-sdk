import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { SWRConfig } from "swr";
import { afterEach, expect, it, vi } from "vitest";
import { usePrivateInfiniteQuery } from "@orderly.network/hooks/src/usePrivateInfiniteQuery";
import { useRefreshOrderCaches } from "@orderly.network/hooks/src/useRefreshOrderCaches";
import { AccountStatusEnum } from "@orderly.network/types";

const mocks = vi.hoisted(() => ({ accountId: "a", get: vi.fn() }));
vi.mock("@orderly.network/hooks/src/useAccount", () => ({
  useAccount: () => ({
    state: {
      accountId: mocks.accountId,
      status: AccountStatusEnum.EnableTrading,
    },
  }),
}));
vi.mock("@orderly.network/hooks/src/useConfig", () => ({
  useConfig: () => "",
}));
vi.mock("@orderly.network/core", () => ({
  SimpleDI: {
    get: () => ({
      accountId: mocks.accountId,
      signer: { sign: async () => ({}) },
    }),
  },
}));

let root: ReactTestRenderer | undefined;
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  vi.clearAllMocks();
  mocks.accountId = "a";
});

it("keeps throwing key loaders suspended and excludes them from refresh", async () => {
  let refresh!: ReturnType<typeof useRefreshOrderCaches>;
  function Harness() {
    usePrivateInfiniteQuery(
      () => {
        throw new Error("DEPENDENCY_NOT_READY");
      },
      { fetcher: mocks.get },
    );
    refresh = useRefreshOrderCaches();
    return null;
  }
  await act(async () => {
    root = create(createElement(Harness));
  });
  await act(async () => {
    await refresh("a");
  });
  expect(mocks.get).not.toHaveBeenCalled();
});

it("revalidates all loaded ordinary/algo pages using their bound infinite queries", async () => {
  mocks.get.mockImplementation(async (url: string, init: any) => ({
    rows: [{ url, accountId: init.headers["orderly-account-id"] }],
    meta: { total: 2 },
  }));
  let refresh!: ReturnType<typeof useRefreshOrderCaches>;
  let ordinary!: ReturnType<typeof usePrivateInfiniteQuery<any>>;
  let algo!: ReturnType<typeof usePrivateInfiniteQuery<any>>;
  const ordersKey = (index: number) => `/v1/orders?page=${index + 1}`;
  const algoKey = (index: number) => `/v1/algo/orders?page=${index + 1}`;
  function Harness() {
    ordinary = usePrivateInfiniteQuery(ordersKey, {
      initialSize: 2,
      dedupingInterval: 0,
      fetcher: mocks.get,
    });
    algo = usePrivateInfiniteQuery(algoKey, {
      initialSize: 2,
      dedupingInterval: 0,
      fetcher: mocks.get,
    });
    refresh = useRefreshOrderCaches();
    return createElement("span", null, ordinary.data?.length ?? 0);
  }
  const cache = new Map();
  await act(async () => {
    root = create(
      createElement(
        SWRConfig,
        { value: { provider: () => cache } },
        createElement(Harness),
      ),
    );
  });
  await act(async () => {
    await Promise.all([ordinary.mutate(), algo.mutate()]);
  });
  expect(ordinary.error).toBeUndefined();
  expect(ordinary.size).toBe(2);
  expect(mocks.get).toHaveBeenCalled();
  expect(ordinary.data).toHaveLength(2);
  mocks.get.mockClear();
  await act(async () => {
    await refresh("a");
  });
  expect(mocks.get.mock.calls.map(([url]) => url).sort()).toEqual([
    "/v1/algo/orders?page=1",
    "/v1/algo/orders?page=2",
    "/v1/orders?page=1",
    "/v1/orders?page=2",
  ]);
  await act(async () => {
    mocks.accountId = "b";
    root!.update(
      createElement(
        SWRConfig,
        { value: { provider: () => cache } },
        createElement(Harness),
      ),
    );
  });
  mocks.get.mockClear();
  await act(async () => {
    await refresh("a");
  });
  expect(mocks.get).not.toHaveBeenCalled();
});
