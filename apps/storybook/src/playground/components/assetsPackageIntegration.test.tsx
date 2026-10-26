import { createElement, useState } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AccountStatusEnum, ChainNamespace } from "@orderly.network/types";
import { useAssetViewScript } from "@orderly.network/ui-assets/src/components/assetView/assetView.script";
import { useFaucetScript } from "@orderly.network/ui-assets/src/components/assetView/faucet/faucet.script";
import { useFirstTimeDeposit } from "@orderly.network/ui-assets/src/hooks/useFirstTimeDeposit";

const mocks = vi.hoisted(() => ({
  status: 0,
  totalValue: 0,
  deposits: 0,
  wrongNetwork: false,
  disabledConnect: false,
  connectedChain: { id: 421614 } as { id: number } | undefined,
  testnet: true,
  namespace: "evm",
  history: vi.fn(),
  storage: vi.fn(),
  mutation: vi.fn(),
  alert: vi.fn(),
  show: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
  settle: vi.fn(),
}));
vi.mock("@orderly.network/hooks", () => ({
  useAccount: () => ({
    state: { status: mocks.status, address: "test-address", subAccounts: [] },
    isMainAccount: true,
    account: { walletAdapter: { chainId: 421614 } },
  }),
  useAccountInstance: () => ({ settle: mocks.settle }),
  useEventEmitter: () => ({ emit: vi.fn() }),
  useConfig: (name?: string) =>
    name
      ? "testnet"
      : {
          get: (key: string) =>
            key === "operatorUrl" ? "https://operator.example" : "test-broker",
        },
  useCollateral: () => ({ totalValue: mocks.totalValue, freeCollateral: 50 }),
  useAssetsHistory: (...args: unknown[]) => {
    mocks.history(...args);
    return [[], { meta: { total: mocks.deposits } }];
  },
  useWalletConnector: () => ({
    connectedChain: mocks.connectedChain,
    namespace: mocks.namespace,
  }),
  useChains: () => [[], { isTestnetChain: () => mocks.testnet }],
  useMutation: (url: string) => [
    (...args: unknown[]) => mocks.mutation(url, ...args),
    {},
  ],
  useLocalStorage: (key: string, initial: boolean) => {
    mocks.storage(key);
    return useState(initial);
  },
  useMarginRatio: () => ({
    marginRatio: 0.2,
    mmr: 0.03,
    maintenanceMargin: 3,
    currentLeverage: 2,
  }),
  usePositionStream: () => [{ aggregated: { notional: 10 } }, {}],
  useComputedLTV: () => 0.1,
}));
vi.mock("@orderly.network/react-app", () => ({
  useAppContext: () => ({
    wrongNetwork: mocks.wrongNetwork,
    disabledConnect: mocks.disabledConnect,
  }),
  useDataTap: (value: unknown) => value,
}));
vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) =>
      options?.quantity ? `${key}:${options.quantity}` : key,
  }),
}));
vi.mock("@orderly.network/ui", () => ({
  modal: { alert: mocks.alert, show: mocks.show },
  toast: { success: mocks.success, error: mocks.error },
}));
vi.mock("@orderly.network/ui-transfer", () => ({
  DepositAndWithdrawWithDialogId: "deposit-withdraw",
  TransferDialogId: "transfer",
}));

let root: ReactTestRenderer;
function mount<T>(hook: () => T): () => T {
  let state!: T;
  function Harness() {
    state = hook();
    return null;
  }
  act(() => {
    root = create(createElement(Harness));
  });
  return () => state;
}
beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(mocks, {
    status: AccountStatusEnum.EnableTrading,
    totalValue: 0,
    deposits: 0,
    wrongNetwork: false,
    disabledConnect: false,
    connectedChain: { id: 421614 },
    testnet: true,
    namespace: ChainNamespace.evm,
  });
  mocks.mutation.mockResolvedValue({ success: true });
  mocks.settle.mockResolvedValue({ success: true });
});
afterEach(() => {
  if (root) act(() => root.unmount());
});

it("keeps the first-deposit eligibility and query lifecycle after extraction", () => {
  const state = mount(useFirstTimeDeposit);
  expect(state()).toBe(true);
  expect(mocks.history).toHaveBeenCalledWith(
    expect.objectContaining({ page: 1, pageSize: 5 }),
    expect.objectContaining({
      shouldUpdateOnWalletChanged: expect.any(Function),
    }),
  );
});

it.each([
  { wrongNetwork: true },
  { disabledConnect: true },
  { totalValue: 1 },
  { deposits: 1 },
  { status: AccountStatusEnum.Connected },
])(
  "does not show first-deposit prompts for unavailable or funded accounts: %o",
  (patch) => {
    Object.assign(mocks, patch);
    expect(mount(useFirstTimeDeposit)()).toBe(false);
  },
);

it.each([
  { testnet: false },
  { connectedChain: undefined },
  { status: AccountStatusEnum.Connected },
])(
  "keeps Faucet unavailable outside connected trading testnet accounts: %o",
  (patch) => {
    Object.assign(mocks, patch);
    expect(mount(useFaucetScript)().showFaucet).toBe(false);
    expect(mocks.mutation).not.toHaveBeenCalled();
  },
);

it.each([
  [ChainNamespace.evm, "1,000"],
  [ChainNamespace.solana, "100"],
])(
  "uses the existing mocked Faucet payload and namespace message: %s",
  async (namespace, quantity) => {
    mocks.namespace = namespace;
    const state = mount(useFaucetScript);
    expect(state().showFaucet).toBe(true);
    await act(async () => {
      await state().getFaucet();
    });
    expect(mocks.mutation).toHaveBeenCalledWith(
      "https://operator.example/v1/faucet/usdc",
      {
        chain_id: "421614",
        user_address: "test-address",
        broker_id: "test-broker",
      },
    );
    expect(mocks.alert).toHaveBeenCalledWith(
      expect.objectContaining({
        message: `trading.faucet.getTestUSDC.success:${quantity}`,
      }),
    );
  },
);

it("preserves asset visibility storage and opens existing mocked deposit/withdraw/transfer dialogs", async () => {
  const state = mount(useAssetViewScript);
  expect(mocks.storage).toHaveBeenCalledWith("orderly_assets_visible");
  expect(state().visible).toBe(true);
  act(() => state().toggleVisible());
  expect(state().visible).toBe(false);
  await act(async () => {
    await state().onDeposit();
    await state().onWithdraw();
    await state().onTransfer();
    await state().onSettle();
  });
  expect(mocks.show.mock.calls).toEqual([
    ["deposit-withdraw", { activeTab: "deposit" }],
    ["deposit-withdraw", { activeTab: "withdraw" }],
    ["transfer"],
  ]);
  expect(mocks.settle).toHaveBeenCalledOnce();
  expect(state().freeCollateral).toBe(50);
  expect(state().currentLtv).toBe(0.1);
});
