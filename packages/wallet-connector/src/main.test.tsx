import React, { useContext, useState } from "react";
import binanceModule from "@binance/w3w-blocknative-connector";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { act, cleanup, renderHook } from "@testing-library/react";
import type {
  AppState,
  ConnectOptions,
  InitOptions,
  WalletState,
} from "@web3-onboard/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WalletConnectorContext } from "@orderly.network/hooks";
import { initConfig } from "./config";
import { Main } from "./main";

const mocks = vi.hoisted(() => ({
  walletModules: [] as AppState["walletModules"],
  initialWalletInit: [] as InitOptions["wallets"],
  wallets: [] as WalletState[],
  onboard: {} as object,
  init: vi.fn(),
  connectWallet: vi.fn(),
  disconnectWallet: vi.fn(),
  setChain: vi.fn(),
  setWalletModules: vi.fn(),
  getProvider: vi.fn(),
  solConnect: vi.fn(),
  listeners: new Set<() => void>(),
}));

vi.mock("@binance/w3w-ethereum-provider", () => ({
  getProvider: mocks.getProvider,
}));

vi.mock("@web3-onboard/react", async () => {
  const { useSyncExternalStore } = await import("react");
  return {
    init: mocks.init,
    useAppState: (key: "walletModules" | "wallets") =>
      useSyncExternalStore(
        (listener) => {
          mocks.listeners.add(listener);
          return () => {
            mocks.listeners.delete(listener);
          };
        },
        () => mocks[key],
      ),
    useConnectWallet: () => {
      const wallets = useSyncExternalStore(
        (listener) => {
          mocks.listeners.add(listener);
          return () => {
            mocks.listeners.delete(listener);
          };
        },
        () => mocks.wallets,
      );
      return [
        { wallet: wallets[0] ?? null, connecting: false },
        mocks.connectWallet,
        mocks.disconnectWallet,
        vi.fn(),
        mocks.setWalletModules,
        vi.fn(),
      ];
    },
    useSetChain: () => [
      { chains, connectedChain: mocks.wallets[0]?.chains[0] ?? null },
      mocks.setChain,
    ],
  };
});

vi.mock("@orderly.network/hooks", async () => {
  const { createContext } = await import("react");
  return {
    WalletConnectorContext: createContext(undefined),
    useSimpleDI: () => ({ get: () => mocks.onboard }),
  };
});

vi.mock("@orderly.network/types", () => ({
  ChainNamespace: { evm: "EVM", solana: "SOL" },
}));

vi.mock("@orderly.network/utils", () => ({
  hex2int: (value: string) => parseInt(value, 16),
}));

vi.mock("@web3-onboard/injected-wallets", () => ({
  default: () => () => [],
}));

vi.mock("./useSOL", () => ({
  useSOL: () => ({
    connected: false,
    connecting: false,
    connect: mocks.solConnect,
  }),
}));

const chains = [
  {
    id: "0x66eee",
    namespace: "evm",
    label: "Arbitrum Sepolia",
    rpcUrl: "https://testnet.example",
  },
  {
    id: "0xa4b1",
    namespace: "evm",
    label: "Arbitrum",
    rpcUrl: "https://arbitrum.example",
  },
  {
    id: "0x1",
    namespace: "evm",
    label: "Ethereum",
    rpcUrl: "https://ethereum.example",
  },
  {
    id: "0x2105",
    namespace: "evm",
    label: "Base",
    rpcUrl: "https://base.example",
  },
] as const;

function renderConnector() {
  return renderHook(() => useContext(WalletConnectorContext), {
    wrapper: ({ children }: React.PropsWithChildren) => (
      <Main solanaNetwork={WalletAdapterNetwork.Mainnet}>{children}</Main>
    ),
  });
}

function renderPage() {
  return renderHook(
    () => {
      const connector = useContext(WalletConnectorContext);
      const [chainId, selectNetwork] = useState(1);
      return {
        ...connector,
        selectNetwork,
        connectCurrentNetwork: () => connector.connect({ chainId }),
      };
    },
    {
      wrapper: ({ children }: React.PropsWithChildren) => (
        <Main solanaNetwork={WalletAdapterNetwork.Mainnet}>{children}</Main>
      ),
    },
  );
}

describe("Binance initial connection network", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.walletModules = [];
    mocks.wallets = [];
    mocks.onboard = {};
    mocks.init.mockImplementation((options: InitOptions) => {
      mocks.initialWalletInit = options.wallets;
      return mocks.onboard;
    });
    mocks.setWalletModules.mockImplementation(
      (wallets: InitOptions["wallets"]) => {
        mocks.walletModules = wallets.flatMap(
          (walletInit) => walletInit({} as never) ?? [],
        );
        mocks.listeners.forEach((listener) => listener());
      },
    );
    mocks.getProvider.mockImplementation(({ chainId }) => ({
      request: vi.fn(async ({ method }) =>
        method === "eth_chainId" ? `0x${chainId.toString(16)}` : ["0x1234"],
      ),
      disconnect: vi.fn(),
    }));
    mocks.connectWallet.mockImplementation(async (options?: ConnectOptions) => {
      // Match Web3 Onboard: wallet modules are created lazily on first connect.
      if (!mocks.walletModules.length) {
        mocks.setWalletModules(mocks.initialWalletInit);
      }
      const label = options?.autoSelect?.label ?? "Binance";
      if (mocks.wallets.some((wallet) => wallet.label === label)) {
        return mocks.wallets;
      }
      const wallet = mocks.walletModules.find(
        (module) => module.label === label,
      )!;
      const { provider } = await wallet.getInterface({
        chains,
        appMetadata: null,
      } as never);
      const addresses = await provider.request({
        method: "eth_requestAccounts",
      });
      const id = await provider.request({ method: "eth_chainId" });
      mocks.wallets = [
        {
          label: wallet.label,
          icon: "",
          provider,
          accounts: addresses.map((address: string) => ({
            address,
            ens: null,
            uns: null,
            balance: null,
          })),
          chains: [{ id, namespace: "evm" }],
        },
      ];
      mocks.listeners.forEach((listener) => listener());
      return mocks.wallets;
    });
    mocks.disconnectWallet.mockImplementation(async ({ label }) => {
      const wallet = mocks.wallets.find((wallet) => wallet.label === label);
      wallet?.provider.disconnect?.();
      mocks.wallets = mocks.wallets.filter((wallet) => wallet.label !== label);
      mocks.listeners.forEach((listener) => listener());
      return mocks.wallets;
    });
    mocks.solConnect.mockResolvedValue([{ label: "Phantom" }]);
    // Exercise the real config boundary with an integrator-supplied Binance wallet.
    initConfig(undefined, {
      wallets: [binanceModule({ options: { lng: "en" } })],
    } as InitOptions);
  });

  afterEach(cleanup);

  it.each([1, "0x1", 42161, 8453])(
    "creates Binance's provider with the selected chain %s before authorization",
    async (chainId) => {
      const { result } = renderConnector();
      expect(mocks.walletModules).toEqual([]);
      await act(async () => {
        await result.current.connect({ chainId });
      });

      expect(mocks.getProvider).toHaveBeenCalledWith(
        expect.objectContaining({
          chainId: Number(chainId),
          lng: "en",
          rpc: {
            421614: "https://testnet.example",
            42161: "https://arbitrum.example",
            1: "https://ethereum.example",
            8453: "https://base.example",
          },
        }),
      );
      expect(mocks.connectWallet).toHaveBeenCalledWith(undefined);
      expect(chains.map((chain) => chain.id)).toEqual([
        "0x66eee",
        "0xa4b1",
        "0x1",
        "0x2105",
      ]);
    },
  );

  it("uses the latest selection when retrying after a rejected connection", async () => {
    mocks.getProvider.mockImplementationOnce(() => ({
      request: vi.fn().mockRejectedValue(new Error("User rejected")),
      disconnect: vi.fn(),
    }));
    const { result } = renderConnector();
    await act(async () => {
      await expect(result.current.connect({ chainId: 1 })).rejects.toThrow(
        "User rejected",
      );
    });
    await act(async () => {
      await result.current.connect({ chainId: 8453 });
    });

    expect(
      mocks.getProvider.mock.calls.map(([options]) => options.chainId),
    ).toEqual([1, 8453]);
  });

  it("preserves automatic wallet selection", async () => {
    const { result } = renderConnector();
    const autoSelect = { label: "Binance", disableModals: true };
    await act(async () => {
      await result.current.connect({ chainId: 1, autoSelect });
    });
    expect(mocks.connectWallet).toHaveBeenCalledWith({ autoSelect });
    expect(mocks.getProvider).toHaveBeenCalledWith(
      expect.objectContaining({ chainId: 1 }),
    );
  });

  it("preserves other wallet modules and their network order", async () => {
    const getInterface = vi.fn().mockResolvedValue({ provider: {} });
    const injected = { label: "MetaMask", getIcon: vi.fn(), getInterface };
    mocks.walletModules = [
      binanceModule()({} as never) as AppState["walletModules"][number],
      injected,
    ];
    const { result } = renderConnector();
    await act(async () => {
      await result.current.connect({ chainId: 1 });
    });
    const module = mocks.walletModules.find(
      (wallet) => wallet.label === "MetaMask",
    )!;
    expect(module).toBe(injected);
    const helpers = { chains, appMetadata: null };
    await module.getInterface(helpers as never);
    expect(getInterface).toHaveBeenCalledWith(helpers);
  });

  it("does not reuse the previous selection when no network is specified", async () => {
    const { result } = renderConnector();
    await act(async () => {
      await result.current.connect({ chainId: 1 });
    });
    await act(async () => {
      await result.current.disconnect({});
    });
    await act(async () => {
      await result.current.connect({});
    });
    expect(
      mocks.getProvider.mock.calls.map(([options]) => options.chainId),
    ).toEqual([1, 421614]);
  });

  it("retains the connector default for an unconfigured network", async () => {
    const { result } = renderConnector();
    await act(async () => {
      await result.current.connect({ chainId: 999999 });
    });
    expect(mocks.getProvider).toHaveBeenCalledWith(
      expect.objectContaining({ chainId: 421614 }),
    );
  });

  it("keeps Solana connections on the Solana adapter", async () => {
    const { result } = renderConnector();
    await act(async () => {
      await result.current.connect({ chainId: 900900900 });
    });
    expect(mocks.solConnect).toHaveBeenCalledOnce();
    expect(mocks.connectWallet).not.toHaveBeenCalled();
    expect(mocks.setWalletModules).not.toHaveBeenCalled();
  });

  it.each([8453, 42161, 1])(
    "reconnects Binance on selected chain %s after disconnecting",
    async (chainId) => {
      const { result } = renderPage();
      expect(mocks.walletModules).toEqual([]);
      await act(async () => {
        await result.current.connectCurrentNetwork();
      });
      const firstProvider = result.current.wallet!.provider;
      expect(result.current.connectedChain?.id).toBe(1);

      await act(async () => {
        await result.current.disconnect({});
      });
      expect(mocks.disconnectWallet).toHaveBeenCalledWith({ label: "Binance" });
      expect(firstProvider.disconnect).toHaveBeenCalledOnce();
      expect(result.current.wallet).toBeNull();
      expect(result.current.connectedChain).toBeNull();

      await act(async () => {
        result.current.selectNetwork(chainId);
      });
      expect(mocks.setChain).not.toHaveBeenCalled();
      await act(async () => {
        await result.current.connectCurrentNetwork();
      });
      expect(result.current.connectedChain?.id).toBe(chainId);
      expect(result.current.wallet!.provider).not.toBe(firstProvider);
      expect(
        mocks.getProvider.mock.calls.map(([options]) => options.chainId),
      ).toEqual([1, chainId]);
      expect(mocks.setWalletModules).toHaveBeenCalledOnce();
    },
  );

  it.each(["MetaMask", "Rabby Wallet", "WalletConnect"])(
    "preserves %s initialization, connect options and network order",
    async (label) => {
      const provider = {
        request: vi.fn(async ({ method }) =>
          method === "eth_chainId" ? "0xa4b1" : ["0x5678"],
        ),
        disconnect: vi.fn(),
      };
      const getInterface = vi.fn().mockResolvedValue({ provider });
      const module = { label, getIcon: vi.fn(), getInterface };
      const walletInit = vi.fn(() => module);
      const walletOptions = {
        wallets: [walletInit, () => null],
      } as InitOptions;
      initConfig(undefined, walletOptions);
      expect(walletInit).not.toHaveBeenCalled();
      const { result } = renderConnector();
      const autoSelect = { label, disableModals: true };
      await act(async () => {
        await result.current.connect({ chainId: 1, autoSelect });
      });
      expect(walletInit).toHaveBeenCalledOnce();
      expect(mocks.walletModules).toEqual([module]);
      expect(mocks.walletModules[0]).toBe(module);
      expect(getInterface).toHaveBeenCalledWith({ chains, appMetadata: null });
      expect(getInterface.mock.calls[0][0].chains).toBe(chains);
      expect(mocks.connectWallet).toHaveBeenCalledWith({ autoSelect });
      expect(result.current.wallet?.label).toBe(label);
      expect(result.current.wallet?.provider).toBe(provider);
      expect(mocks.getProvider).not.toHaveBeenCalled();

      await act(async () => {
        await result.current.disconnect({});
      });
      await act(async () => {
        await result.current.connect({ chainId: 8453, autoSelect });
      });
      expect(provider.disconnect).toHaveBeenCalledOnce();
      expect(getInterface).toHaveBeenCalledTimes(2);
      expect(getInterface.mock.calls[1][0].chains).toBe(chains);
      expect(mocks.setWalletModules).toHaveBeenCalledOnce();
    },
  );

  it("preserves a WalletInit that returns multiple wallet modules", async () => {
    const other = {
      label: "MetaMask",
      getIcon: vi.fn(),
      getInterface: vi.fn(),
    };
    const binance = binanceModule()(
      {} as never,
    ) as AppState["walletModules"][number];
    initConfig(undefined, {
      wallets: [() => [other, binance], () => null],
    } as InitOptions);
    const { result } = renderConnector();
    await act(async () => {
      await result.current.connect({ chainId: 8453 });
    });
    expect(mocks.walletModules[0]).toBe(other);
    expect(mocks.getProvider).toHaveBeenCalledWith(
      expect.objectContaining({ chainId: 8453 }),
    );
  });

  it("retargets modules on an externally initialized Onboard instance", async () => {
    const binance = binanceModule()(
      {} as never,
    ) as AppState["walletModules"][number];
    mocks.walletModules = [binance];
    mocks.onboard = {};
    const { result } = renderConnector();
    await act(async () => {
      await result.current.connect({ chainId: 1 });
    });
    await act(async () => {
      await result.current.disconnect({});
    });
    await act(async () => {
      await result.current.connect({ chainId: 8453 });
    });
    expect(
      mocks.getProvider.mock.calls.map(([options]) => options.chainId),
    ).toEqual([1, 8453]);
  });

  it("uses the selected network on first connect with the default wallet config", async () => {
    initConfig();
    const { result } = renderConnector();
    expect(mocks.walletModules).toEqual([]);
    await act(async () => {
      await result.current.connect({ chainId: 1 });
    });
    expect(mocks.getProvider).toHaveBeenCalledWith(
      expect.objectContaining({ chainId: 1 }),
    );
    expect(mocks.setWalletModules).toHaveBeenCalledOnce();
  });

  it("handles Binance modules added after initialization", async () => {
    const { result } = renderConnector();
    await act(async () => {
      await result.current.connect({ chainId: 1 });
    });
    await act(async () => {
      await result.current.disconnect({});
    });
    await act(async () => {
      mocks.setWalletModules([binanceModule()]);
    });
    await act(async () => {
      await result.current.connect({ chainId: 8453 });
    });
    expect(
      mocks.getProvider.mock.calls.map(([options]) => options.chainId),
    ).toEqual([1, 8453]);
  });

  it("keeps existing Binance modules in sync when the same API is initialized again", async () => {
    const { result } = renderConnector();
    await act(async () => {
      await result.current.connect({ chainId: 1 });
    });
    await act(async () => {
      await result.current.disconnect({});
    });
    initConfig();
    await act(async () => {
      await result.current.connect({ chainId: 8453 });
    });
    expect(
      mocks.getProvider.mock.calls.map(([options]) => options.chainId),
    ).toEqual([1, 8453]);
    expect(mocks.setWalletModules).toHaveBeenCalledOnce();
  });
});
