// @vitest-environment jsdom
import { act, cleanup, render, waitFor } from "@testing-library/react";
import {
  type Config,
  connect as connectCore,
  createConfig,
  disconnect as disconnectCore,
  getAccount,
  mock,
} from "@wagmi/core";
import { http } from "viem";
import { mainnet } from "viem/chains";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WALLET_CONNECT_ERROR } from "../../connectEvents";
import { WalletConnectType } from "../../types";
import { useWagmiWallet, WagmiWalletProvider } from "./wagmiWalletProvider";

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
};

const createDeferred = <T = void,>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const mocks = vi.hoisted(() => {
  const wcConnector = {
    uid: "wc",
    id: "walletConnect",
    name: "WalletConnect",
    type: "walletConnect",
    getProvider: vi.fn().mockResolvedValue({}),
  };
  const emit = vi.fn();
  const listeners = new Map<string, Set<(payload?: unknown) => void>>();
  return {
    listeners,
    config: undefined as Config | undefined,
    eventEmitter: {
      emit,
      on: (event: string, listener: (payload?: unknown) => void) => {
        if (!listeners.has(event)) listeners.set(event, new Set());
        listeners.get(event)!.add(listener);
      },
      off: (event: string, listener: (payload?: unknown) => void) => {
        listeners.get(event)?.delete(listener);
      },
    },
    wcConnector,
    account: {
      connector: wcConnector as typeof wcConnector | undefined,
      isConnected: true,
      address: "0xold" as string | undefined,
      chainId: 42161 as number | undefined,
    },
    connections: new Map<string, unknown>([["wc", {}]]),
    connect: vi.fn(),
    disconnectAsync: vi.fn(),
    emit,
  };
});

vi.mock("wagmi", () => ({
  useAccount: () => (mocks.config ? getAccount(mocks.config) : mocks.account),
  useConfig: () =>
    mocks.config ?? {
      state: { connections: mocks.connections },
    },
  useConnect: () => ({
    connect: mocks.connect,
    connectors: mocks.config?.connectors ?? [mocks.wcConnector],
  }),
  useDisconnect: () => ({ disconnectAsync: mocks.disconnectAsync }),
  useSwitchChain: () => ({ switchChain: vi.fn() }),
}));

vi.mock("@orderly.network/hooks", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  return {
    useEventEmitter: () => mocks.eventEmitter,
    useLocalStorage: (key: string, initialValue: unknown) => {
      const [value, setValue] = React.useState(() => {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : initialValue;
      });
      const update = React.useCallback(
        (next: unknown) => {
          window.localStorage.setItem(key, JSON.stringify(next));
          setValue(next);
        },
        [key],
      );
      return [value, update];
    },
  };
});

vi.mock("@orderly.network/ui-connector", () => ({
  WALLET_CONNECT_ABORTED: "wallet:connect-aborted",
}));

const DISCONNECTED_CONNECTORS_KEY = "orderly:wagmiDisconnectedConnectors";

const readDisconnectedConnectors = () =>
  JSON.parse(
    window.localStorage.getItem(DISCONNECTED_CONNECTORS_KEY) ?? "[]",
  ) as string[];

const abortConnect = () => {
  mocks.listeners
    .get("wallet:connect-aborted")
    ?.forEach((listener) => listener());
};

let current: ReturnType<typeof useWagmiWallet>;

const Probe = () => {
  current = useWagmiWallet();
  return null;
};

const renderProvider = () => {
  const result = render(
    <WagmiWalletProvider disabled={false}>
      <Probe />
    </WagmiWalletProvider>,
  );
  return {
    unmount: result.unmount,
    rerender: () =>
      result.rerender(
        <WagmiWalletProvider disabled={false}>
          <Probe />
        </WagmiWalletProvider>,
      ),
  };
};

const setWagmiDisconnected = () => {
  mocks.account = {
    connector: undefined,
    isConnected: false,
    address: undefined,
    chainId: undefined,
  };
  mocks.connections.clear();
};

describe("WagmiWalletProvider disconnect", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.resetAllMocks();
    window.localStorage.clear();
    mocks.listeners.clear();
    mocks.config = undefined;
    mocks.wcConnector.getProvider.mockResolvedValue({});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    mocks.account = {
      connector: mocks.wcConnector,
      isConnected: true,
      address: "0xold",
      chainId: 42161,
    };
    mocks.connections.clear();
    mocks.connections.set("wc", {});
  });

  it("ends the local connection while the connector cleanup is still pending", async () => {
    const cleanupRequest = createDeferred();
    mocks.disconnectAsync.mockReturnValue(cleanupRequest.promise);
    renderProvider();
    await waitFor(() => expect(current.wallet).toBeDefined());
    expect(current.isConnected).toBe(true);

    await act(async () => {
      await current.disconnect();
    });

    expect(mocks.disconnectAsync).toHaveBeenCalledWith({
      connector: mocks.wcConnector,
    });
    expect(current.isConnected).toBe(false);
    expect(current.wallet).toBeUndefined();
    expect(current.connectedChain).toBeNull();
  });

  it("keeps the old connection hidden when the background cleanup fails", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const cleanupRequest = createDeferred();
    mocks.disconnectAsync.mockReturnValue(cleanupRequest.promise);
    renderProvider();

    await act(async () => {
      await current.disconnect();
    });
    await act(async () => {
      cleanupRequest.reject(new Error("relay publish failed"));
      await cleanupRequest.promise.catch(() => {});
    });

    expect(current.isConnected).toBe(false);
    expect(warn).toHaveBeenCalledWith(
      "[wagmi] Background wallet disconnect failed",
      expect.any(Error),
    );
    warn.mockRestore();
  });

  it("waits for the pending cleanup before connecting again", async () => {
    const cleanupRequest = createDeferred();
    mocks.disconnectAsync.mockReturnValue(cleanupRequest.promise);
    const { rerender } = renderProvider();

    await act(async () => {
      await current.disconnect();
    });
    act(() => current.connect({ connector: mocks.wcConnector }));
    expect(mocks.connect).not.toHaveBeenCalled();

    await act(async () => {
      setWagmiDisconnected();
      cleanupRequest.resolve();
      await cleanupRequest.promise;
    });
    rerender();

    await waitFor(() => expect(mocks.connect).toHaveBeenCalledTimes(1));
  });

  it("connects synchronously when no cleanup is pending", () => {
    renderProvider();

    act(() => current.connect({ connector: mocks.wcConnector }));

    expect(mocks.connect).toHaveBeenCalledTimes(1);
  });

  it("reuses the pending cleanup when disconnect is clicked repeatedly", async () => {
    const request = createDeferred();
    mocks.disconnectAsync.mockReturnValue(request.promise);
    renderProvider();

    await act(async () => {
      await current.disconnect();
      await current.disconnect();
    });

    expect(mocks.disconnectAsync).toHaveBeenCalledTimes(1);
    expect(current.isConnected).toBe(false);
    expect(current.wallet).toBeUndefined();
    expect(current.connectedChain).toBeNull();
  });

  it("reports a failed cleanup retry without attempting to connect", async () => {
    const error = new Error("unsubscribe failed");
    mocks.disconnectAsync.mockRejectedValue(error);
    renderProvider();

    await act(async () => {
      await current.disconnect();
    });
    await act(async () => {
      current.connect({ connector: mocks.wcConnector });
    });

    expect(mocks.disconnectAsync).toHaveBeenCalledTimes(2);
    expect(mocks.connect).not.toHaveBeenCalled();
    expect(mocks.emit).toHaveBeenCalledExactlyOnceWith(WALLET_CONNECT_ERROR, {
      walletType: WalletConnectType.EVM,
      message: error.message,
    });
    expect(current.isConnected).toBe(false);
    expect(current.wallet).toBeUndefined();
    expect(current.connectedChain).toBeNull();
  });

  it.each(["success", "failure"])(
    "allows a later retry after cleanup recovers and connection ends in %s",
    async (outcome) => {
      mocks.disconnectAsync.mockRejectedValue(new Error("relay unavailable"));
      const { rerender } = renderProvider();
      await act(async () => {
        await current.disconnect();
      });
      await act(async () => {
        current.connect({ connector: mocks.wcConnector });
      });
      expect(mocks.connect).not.toHaveBeenCalled();

      mocks.disconnectAsync.mockImplementationOnce(async () => {
        setWagmiDisconnected();
      });
      await act(async () => {
        current.connect({ connector: mocks.wcConnector });
      });
      rerender();
      expect(mocks.disconnectAsync).toHaveBeenCalledTimes(3);
      expect(mocks.connect).toHaveBeenCalledTimes(1);

      if (outcome === "success") {
        mocks.account = {
          connector: mocks.wcConnector,
          isConnected: true,
          address: "0xnew",
          chainId: 42161,
        };
        mocks.connections.set("wc", {});
        act(() => mocks.connect.mock.calls[0][1].onSuccess());
        rerender();
        await waitFor(() =>
          expect(current.wallet?.accounts[0].address).toBe("0xnew"),
        );
        expect(current.isConnected).toBe(true);
      } else {
        act(() =>
          mocks.connect.mock.calls[0][1].onError(
            new Error("connection failed"),
          ),
        );
        expect(current.isConnected).toBe(false);
        expect(current.wallet).toBeUndefined();
        expect(current.connectedChain).toBeNull();
      }
    },
  );

  it.each(["pending", "failed"])(
    "keeps the same connector suppressed across account and chain changes when cleanup is %s",
    async (outcome) => {
      const request = createDeferred();
      mocks.disconnectAsync.mockReturnValue(request.promise);
      const { rerender } = renderProvider();
      await act(async () => {
        await current.disconnect();
      });
      if (outcome === "failed") {
        await act(async () => {
          request.reject(new Error("relay unavailable"));
        });
      }
      for (const update of [
        { address: "0xnew" },
        { chainId: 1 },
        { address: "0xold" },
      ]) {
        mocks.account = { ...mocks.account, ...update };
        rerender();
        expect(current.isConnected).toBe(false);
        expect(current.wallet).toBeUndefined();
        expect(current.connectedChain).toBeNull();
      }
    },
  );

  it.each(["resolve", "reject"])(
    "ignores an old provider that will %s after disconnect",
    async (outcome) => {
      const provider = createDeferred<object>();
      mocks.wcConnector.getProvider.mockReturnValue(provider.promise);
      mocks.disconnectAsync.mockReturnValue(new Promise(() => {}));
      renderProvider();
      await act(async () => {
        await current.disconnect();
      });
      await act(async () => {
        if (outcome === "resolve") provider.resolve({});
        else provider.reject(new Error("stale provider"));
      });
      expect(current.wallet).toBeUndefined();
      expect(current.isConnected).toBe(false);
      expect(mocks.emit).not.toHaveBeenCalled();
    },
  );

  it.each(["resolve", "reject"])(
    "does not overwrite a new wallet when an old provider will %s",
    async (outcome) => {
      const provider = createDeferred<object>();
      mocks.wcConnector.getProvider.mockReturnValueOnce(provider.promise);
      const { rerender } = renderProvider();
      mocks.account = {
        ...mocks.account,
        connector: { ...mocks.wcConnector, uid: "new" },
        address: "0xnew",
      };
      rerender();
      await waitFor(() =>
        expect(current.wallet?.accounts[0].address).toBe("0xnew"),
      );
      const newWallet = current.wallet;
      await act(async () => {
        if (outcome === "resolve") provider.resolve({});
        else provider.reject(new Error("stale provider"));
      });
      expect(current.wallet).toBe(newWallet);
      expect(mocks.emit).not.toHaveBeenCalled();
    },
  );

  it("handles disconnect and reconnect within the same event without restoring the old connection", async () => {
    mocks.disconnectAsync.mockRejectedValue(new Error("relay unavailable"));
    renderProvider();
    await act(async () => {
      void current.disconnect();
      current.connect({ connector: mocks.wcConnector });
    });
    expect(mocks.disconnectAsync).toHaveBeenCalledTimes(2);
    expect(mocks.connect).not.toHaveBeenCalled();
    expect(current.isConnected).toBe(false);
  });

  it("retains the failed real wagmi connection until cleanup succeeds before reconnecting", async () => {
    const address = "0x0000000000000000000000000000000000000001";
    const config = createConfig({
      chains: [mainnet],
      connectors: [mock({ accounts: [address] })],
      transports: { [mainnet.id]: http() },
      storage: null,
      ssr: true,
    });
    const connector = config.connectors[0];
    await connectCore(config, { connector });
    const cleanupConnector = vi
      .spyOn(connector, "disconnect")
      .mockRejectedValue(new Error("relay unavailable"));
    mocks.config = config;
    mocks.disconnectAsync.mockImplementation((args) =>
      disconnectCore(config, args),
    );
    mocks.connect.mockImplementation((args, callbacks) => {
      void connectCore(config, args).then(
        callbacks.onSuccess,
        callbacks.onError,
      );
    });
    const { rerender } = renderProvider();
    await act(async () => {
      await current.disconnect();
    });
    expect(config.state.current).toBe(connector.uid);
    expect(config.state.connections.has(connector.uid)).toBe(true);
    await act(async () => {
      current.connect({ connector });
    });
    expect(cleanupConnector).toHaveBeenCalledTimes(2);
    expect(mocks.connect).not.toHaveBeenCalled();
    expect(mocks.emit).toHaveBeenCalledExactlyOnceWith(WALLET_CONNECT_ERROR, {
      walletType: WalletConnectType.EVM,
      message: "relay unavailable",
    });

    cleanupConnector.mockRestore();
    await act(async () => {
      current.connect({ connector });
    });
    rerender();
    expect(mocks.connect).toHaveBeenCalledTimes(1);
    expect(config.state.status).toBe("connected");
    expect(config.state.current).toBe(connector.uid);
    await waitFor(() =>
      expect(current.wallet?.accounts[0].address).toBe(address),
    );
    expect(current.isConnected).toBe(true);
    expect(mocks.emit).toHaveBeenCalledTimes(1);
  });

  it("does not hide a fresh connection after the cleanup completes", async () => {
    const cleanupRequest = createDeferred();
    mocks.disconnectAsync.mockReturnValue(cleanupRequest.promise);
    const { rerender } = renderProvider();

    await act(async () => {
      await current.disconnect();
    });
    expect(current.isConnected).toBe(false);

    await act(async () => {
      setWagmiDisconnected();
      cleanupRequest.resolve();
      await cleanupRequest.promise;
    });
    rerender();
    expect(current.isConnected).toBe(false);

    mocks.account = {
      connector: mocks.wcConnector,
      isConnected: true,
      address: "0xold",
      chainId: 42161,
    };
    mocks.connections.set("wc", {});
    rerender();

    expect(current.isConnected).toBe(true);
  });
  it("drops a queued connect when the connect request is aborted", async () => {
    const cleanupRequest = createDeferred();
    mocks.disconnectAsync.mockReturnValue(cleanupRequest.promise);
    const { rerender } = renderProvider();

    await act(async () => {
      await current.disconnect();
    });
    act(() => current.connect({ connector: mocks.wcConnector }));
    act(() => abortConnect());

    await act(async () => {
      setWagmiDisconnected();
      cleanupRequest.resolve();
      await cleanupRequest.promise;
    });
    rerender();

    expect(mocks.connect).not.toHaveBeenCalled();
  });

  it.each([
    ["initial", "success"],
    ["initial", "failure"],
    ["retry", "success"],
    ["retry", "failure"],
  ])(
    "drops a queued connect after unmount during %s cleanup ending in %s",
    async (phase, outcome) => {
      const cleanupRequest = createDeferred();
      if (phase === "retry") {
        mocks.disconnectAsync.mockRejectedValueOnce(
          new Error("relay unavailable"),
        );
      }
      mocks.disconnectAsync.mockReturnValue(cleanupRequest.promise);
      const { unmount } = renderProvider();

      await act(async () => {
        await current.disconnect();
      });
      await act(async () => {
        current.connect({ connector: mocks.wcConnector });
      });
      const cleanupCount = phase === "retry" ? 2 : 1;
      expect(mocks.disconnectAsync).toHaveBeenCalledTimes(cleanupCount);
      expect(mocks.connect).not.toHaveBeenCalled();
      unmount();

      await act(async () => {
        if (outcome === "success") {
          setWagmiDisconnected();
          cleanupRequest.resolve();
        } else {
          cleanupRequest.reject(new Error("cleanup failed after unmount"));
        }
      });

      expect(mocks.connect).not.toHaveBeenCalled();
      expect(mocks.emit).not.toHaveBeenCalled();
      expect(mocks.disconnectAsync).toHaveBeenCalledTimes(cleanupCount);
    },
  );

  it("only runs the latest queued connect", async () => {
    const cleanupRequest = createDeferred();
    mocks.disconnectAsync.mockReturnValue(cleanupRequest.promise);
    const otherConnector = { ...mocks.wcConnector, uid: "io", id: "io.rabby" };
    renderProvider();

    await act(async () => {
      await current.disconnect();
    });
    act(() => current.connect({ connector: mocks.wcConnector }));
    act(() => current.connect({ connector: otherConnector }));

    await act(async () => {
      setWagmiDisconnected();
      cleanupRequest.resolve();
      await cleanupRequest.promise;
    });

    await waitFor(() => expect(mocks.connect).toHaveBeenCalledTimes(1));
    expect(mocks.connect.mock.calls[0][0]).toEqual({
      connector: otherConnector,
    });
  });

  it("persists the disconnected connector until cleanup succeeds", async () => {
    const cleanupRequest = createDeferred();
    mocks.disconnectAsync.mockReturnValue(cleanupRequest.promise);
    renderProvider();

    await act(async () => {
      await current.disconnect();
    });
    expect(readDisconnectedConnectors()).toEqual(["walletConnect"]);

    await act(async () => {
      cleanupRequest.resolve();
      await cleanupRequest.promise;
    });
    expect(readDisconnectedConnectors()).toEqual([]);
  });

  it("keeps a connector disconnected before reload hidden and cleans it up", async () => {
    window.localStorage.setItem(
      DISCONNECTED_CONNECTORS_KEY,
      JSON.stringify(["walletConnect"]),
    );
    const cleanupRequest = createDeferred();
    mocks.disconnectAsync.mockReturnValue(cleanupRequest.promise);
    renderProvider();

    expect(current.isConnected).toBe(false);
    expect(current.wallet).toBeUndefined();
    expect(current.connectedChain).toBeNull();
    expect(mocks.disconnectAsync).toHaveBeenCalledExactlyOnceWith({
      connector: mocks.wcConnector,
    });

    await act(async () => {
      cleanupRequest.resolve();
      await cleanupRequest.promise;
    });
    expect(readDisconnectedConnectors()).toEqual([]);
  });

  it("does not loop cleanup retries after reload when cleanup fails", async () => {
    window.localStorage.setItem(
      DISCONNECTED_CONNECTORS_KEY,
      JSON.stringify(["walletConnect"]),
    );
    mocks.disconnectAsync.mockRejectedValue(new Error("relay unavailable"));
    const { rerender } = renderProvider();

    await act(async () => {
      await Promise.resolve();
    });
    mocks.account = { ...mocks.account, chainId: 1 };
    rerender();

    expect(mocks.disconnectAsync).toHaveBeenCalledTimes(1);
    expect(current.isConnected).toBe(false);
    expect(readDisconnectedConnectors()).toEqual(["walletConnect"]);
  });
});
