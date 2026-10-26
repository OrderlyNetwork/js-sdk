import React, { PropsWithChildren } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { SWRConfig, unstable_serialize } from "swr";
import { AccountStatusEnum, type API } from "@orderly.network/types";
import { useAccountInfo } from "./useAccountInfo";
import { usePrivateDataObserver } from "./usePrivateDataObserver";

let mockAccountId: string | undefined = "A";
let mockStatus = AccountStatusEnum.EnableTrading;
const mockRequests: Array<{
  accountId: string;
  resolve: (data: API.AccountInfo) => void;
  reject: (error: Error) => void;
}> = [];
const mockMessages = new Map<string, (message: any) => void>();
const mockStatuses = new Set<(event: any) => void>();
const mockSetAccountInfo = jest.fn();
const mockAccount = { on: jest.fn(), off: jest.fn() };
const mockWs = {
  privateSubscribe: (topic: unknown, handler: any) => {
    if (typeof topic === "string") mockMessages.set(topic, handler.onMessage);
    return () => {
      if (
        typeof topic === "string" &&
        mockMessages.get(topic) === handler.onMessage
      )
        mockMessages.delete(topic);
    };
  },
  on: (_event: string, handler: (event: any) => void) =>
    mockStatuses.add(handler),
  off: (_event: string, handler: (event: any) => void) =>
    mockStatuses.delete(handler),
};

jest.mock("@orderly.network/net", () => ({
  get: () =>
    new Promise<API.AccountInfo>((resolve, reject) => {
      mockRequests.push({ accountId: mockAccountId!, resolve, reject });
    }),
}));
jest.mock("@orderly.network/core", () => ({
  EVENT_NAMES: { statusChanged: "statusChanged" },
}));
jest.mock("../middleware/signatureMiddleware", () => ({
  signatureMiddleware: (next: any) => (key: any, fetcher: any, config: any) =>
    next(key, (args: any) => fetcher(args[0], {}), config),
}));
jest.mock("../useAccount", () => ({
  useAccount: () => ({
    state: { accountId: mockAccountId, status: mockStatus },
    account: mockAccount,
  }),
}));
jest.mock("../useWS", () => ({ useWS: () => mockWs }));
jest.mock("../usePrivateQuery", () => {
  const actual = jest.requireActual("../usePrivateQuery");
  return {
    usePrivateQuery: (url: string, options: unknown) => {
      // Only Client Info is needed; retain its real SWR and account key path.
      const result = actual.usePrivateQuery(
        url === "/v1/client/info" ? url : null,
        options,
      );
      return result;
    },
  };
});
jest.mock("../useEventEmitter", () => ({
  useEventEmitter: () => ({ emit: jest.fn() }),
}));
jest.mock("../useLocalStorage", () => ({ useLocalStorage: () => [false] }));
jest.mock("../useCalculatorService", () => ({
  useCalculatorService: () => ({}),
}));
jest.mock("../next/apiStatus/apiStatus.store", () => ({
  useApiStatusActions: () => ({}),
}));
jest.mock("./appStore", () => ({
  useAppStore: () => ({ setAccountInfo: mockSetAccountInfo }),
}));
jest.mock("./orderlyHooks", () => ({ usePositionActions: () => ({}) }));
jest.mock("./binaryInfo", () => ({ useBinaryInfoObserver: () => undefined }));

const info = (accountId = "A", taker = 6, maker = 20): API.AccountInfo =>
  ({
    account_id: accountId,
    binary_taker_fee_rate: taker,
    binary_maker_fee_rate: maker,
    futures_taker_fee_rate: 8,
    rwa_taker_fee_rate: 10,
    tier: "test-tier",
  }) as API.AccountInfo;

const mount = () => {
  const cache = new Map();
  const wrapper = ({ children }: PropsWithChildren) => (
    <SWRConfig
      value={{
        provider: () => cache,
        dedupingInterval: 0,
        shouldRetryOnError: false,
        // Consumers must stay account-scoped even under a host's preference.
        keepPreviousData: true,
      }}
    >
      {children}
    </SWRConfig>
  );
  return {
    cache,
    ...renderHook(
      () => {
        usePrivateDataObserver({ getKeysMap: () => new Map() });
        return { first: useAccountInfo(), second: useAccountInfo() };
      },
      { wrapper },
    ),
  };
};
const message = (detail: Record<string, unknown>) => {
  act(() => mockMessages.get("account")?.({ accountDetail: detail }));
};
const status = (event: Record<string, unknown>) => {
  act(() => mockStatuses.forEach((handler) => handler(event)));
};
const resolveRequest = async (index: number, data = info()) => {
  await act(async () => mockRequests[index].resolve(data));
};

beforeEach(() => {
  mockAccountId = "A";
  mockStatus = AccountStatusEnum.EnableTrading;
  mockRequests.length = 0;
  mockMessages.clear();
  mockStatuses.clear();
  jest.clearAllMocks();
});

test("fee-only events update both consumers, preserve missing fields and accept zero", async () => {
  const { result } = mount();
  await resolveRequest(0);
  message({ binaryTakerFeeRate: 300 });
  await waitFor(() =>
    expect(result.current.first.data?.binary_taker_fee_rate).toBe(300),
  );
  expect(result.current.second.data).toEqual(result.current.first.data);
  expect(result.current.first.data).toMatchObject({
    binary_maker_fee_rate: 20,
    futures_taker_fee_rate: 8,
    rwa_taker_fee_rate: 10,
    tier: "test-tier",
  });
  message({ binaryMakerFeeRate: 0, binaryTakerFeeRate: 450 });
  await waitFor(() =>
    expect(result.current.first.data?.binary_maker_fee_rate).toBe(0),
  );
  expect(result.current.first.data?.binary_taker_fee_rate).toBe(450);
  message({ binaryTakerFeeRate: 0 });
  await waitFor(() =>
    expect(result.current.first.data?.binary_taker_fee_rate).toBe(0),
  );
  message({ symbolLeverage: { symbol: "PERP_BTC_USDC", leverage: 2 } });
  expect(result.current.first.data?.binary_taker_fee_rate).toBe(0);
  expect(mockRequests).toHaveLength(1);
});

test.each([null, undefined, -1, NaN, Infinity, "300"])(
  "an explicit invalid fee %s becomes unavailable without erasing its peer",
  async (value) => {
    const { result } = mount();
    await resolveRequest(0);
    message({ binaryTakerFeeRate: value });
    await waitFor(() =>
      expect(result.current.first.data?.binary_taker_fee_rate).toBeUndefined(),
    );
    expect(result.current.first.data?.binary_maker_fee_rate).toBe(20);
  },
);

test("updates before initial REST are queued without fabricating an account or cancelling its request", async () => {
  const { result, cache } = mount();
  message({ binaryTakerFeeRate: 100 });
  message({ binaryTakerFeeRate: 300, binaryMakerFeeRate: 0 });
  expect(result.current.first.data).toBeUndefined();
  expect(
    cache.get(unstable_serialize(["/v1/client/info", "A"]))?.data,
  ).toBeUndefined();
  await resolveRequest(0);
  await waitFor(() =>
    expect(result.current.first.data?.binary_taker_fee_rate).toBe(300),
  );
  expect(result.current.first.data?.binary_maker_fee_rate).toBe(0);
  expect(result.current.first.data?.tier).toBe("test-tier");
});

test("a late REST refresh cannot replace a newer fee event", async () => {
  const { result } = mount();
  await resolveRequest(0);
  let refresh: Promise<unknown>;
  act(() => {
    refresh = result.current.first.mutate();
  });
  await waitFor(() => expect(mockRequests).toHaveLength(2));
  message({ binaryTakerFeeRate: 300 });
  await resolveRequest(1, info("A", 100));
  await act(async () => {
    await refresh;
  });
  expect(result.current.first.data?.binary_taker_fee_rate).toBe(300);
});

test("only a private reconnect refreshes the account, including changes missed offline", async () => {
  const { result } = mount();
  await resolveRequest(0);
  message({ binaryTakerFeeRate: 100 });
  status({ type: "open", isPrivate: false, isReconnect: true });
  status({ type: "open", isPrivate: true, isReconnect: false });
  expect(mockRequests).toHaveLength(1);
  status({ type: "open", isPrivate: true, isReconnect: true });
  await waitFor(() => expect(mockRequests).toHaveLength(2));
  await resolveRequest(1, info("A", 300, 0));
  await waitFor(() =>
    expect(result.current.first.data?.binary_taker_fee_rate).toBe(300),
  );
  status({ type: "open", isPrivate: true, isReconnect: true });
  await waitFor(() => expect(mockRequests).toHaveLength(3));
  message({ binaryTakerFeeRate: 450 });
  await resolveRequest(2, info("A", 100));
  expect(result.current.first.data?.binary_taker_fee_rate).toBe(450);
});

test("switching and logout release pending patches and ignore old callbacks", async () => {
  const { result, rerender, unmount, cache } = mount();
  const oldMessage = mockMessages.get("account")!;
  const oldStatus = [...mockStatuses][0];
  message({ binaryTakerFeeRate: 300 });
  mockAccountId = "B";
  rerender();
  act(() => oldMessage({ accountDetail: { binaryTakerFeeRate: 450 } }));
  act(() => oldStatus({ type: "open", isPrivate: true, isReconnect: true }));
  await resolveRequest(1, info("B", 100, 0));
  await resolveRequest(0);
  await waitFor(() => expect(result.current.first.data?.account_id).toBe("B"));
  expect(result.current.first.data?.binary_taker_fee_rate).toBe(100);
  const bMessage = mockMessages.get("account")!;
  mockAccountId = undefined;
  mockStatus = AccountStatusEnum.NotConnected;
  rerender();
  expect(result.current.first.data).toBeUndefined();
  act(() => bMessage({ accountDetail: { binaryTakerFeeRate: 450 } }));
  expect(
    cache.get(unstable_serialize(["/v1/client/info", "B"]))?.data
      .binary_taker_fee_rate,
  ).toBe(100);
  expect(mockStatuses.size).toBe(0);
  unmount();
  expect(mockMessages.has("account")).toBe(false);
});

test("unmounting makes captured account callbacks inert", async () => {
  const { cache, unmount } = mount();
  await resolveRequest(0);
  const onMessage = mockMessages.get("account")!;
  const onStatus = [...mockStatuses][0];
  unmount();
  act(() => {
    onMessage({ accountDetail: { binaryTakerFeeRate: 300 } });
    onStatus({ type: "open", isPrivate: true, isReconnect: true });
  });
  expect(
    cache.get(unstable_serialize(["/v1/client/info", "A"]))?.data
      .binary_taker_fee_rate,
  ).toBe(6);
  expect(mockRequests).toHaveLength(1);
  expect(mockStatuses.size).toBe(0);
});
