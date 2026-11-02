import { useCallback, useEffect, useRef } from "react";
import {
  Connector,
  useAccount,
  useConfig,
  useConnect,
  useDisconnect,
} from "wagmi";
import { useEventEmitter, useLocalStorage } from "@orderly.network/hooks";
import { WALLET_CONNECT_ABORTED } from "@orderly.network/ui-connector";
import {
  getWalletConnectErrorMessage,
  isWalletConnectCancellation,
  WALLET_CONNECT_ERROR,
  WALLET_CONNECT_PROVIDER_CANCEL,
} from "../../connectEvents";
import { WalletConnectType } from "../../types";

type CleanupResult = { success: true } | { success: false; error: unknown };

/**
 * Ids of connectors the user disconnected whose cleanup is unconfirmed.
 * Persisted because wagmi restores a still-stored WalletConnect session on reload.
 */
const DisconnectedConnectorsKey = "orderly:wagmiDisconnectedConnectors";
const EMPTY_CONNECTOR_IDS: string[] = [];

/** Manages local disconnects, background cleanup, and cancellable reconnects. */
export function useWagmiConnection() {
  const config = useConfig();
  const { connect: connectWagmi, connectors: wagmiConnectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const {
    connector,
    isConnected: isWagmiConnected,
    address,
    chainId,
  } = useAccount();
  const ee = useEventEmitter();

  // Wagmi only drops a connection after `connector.disconnect()` resolves,
  // which for WalletConnect waits on relay publish/unsubscribe round trips.
  // Disconnected connectors are hidden locally until that cleanup confirms.
  const [storedDisconnectedConnectors, setStoredDisconnectedConnectors] =
    useLocalStorage<string[]>(DisconnectedConnectorsKey, EMPTY_CONNECTOR_IDS);
  const disconnectedConnectors: string[] = Array.isArray(
    storedDisconnectedConnectors,
  )
    ? storedDisconnectedConnectors
    : EMPTY_CONNECTOR_IDS;
  const disconnectedConnectorsRef = useRef(disconnectedConnectors);
  useEffect(() => {
    disconnectedConnectorsRef.current = disconnectedConnectors;
  }, [disconnectedConnectors]);
  const pendingDisconnectRef = useRef<{
    id: string;
    promise: Promise<CleanupResult>;
  } | null>(null);
  const autoCleanupUidsRef = useRef(new Set<string>());
  const connectRequestIdRef = useRef(0);

  const isSuppressed =
    !!connector && disconnectedConnectors.includes(connector.id);
  const isConnected = isWagmiConnected && !isSuppressed;

  const setConnectorDisconnected = useCallback(
    (id: string, disconnected: boolean) => {
      const previous = disconnectedConnectorsRef.current;
      if (previous.includes(id) === disconnected) {
        return;
      }
      const next = disconnected
        ? [...previous, id]
        : previous.filter((item) => item !== id);
      disconnectedConnectorsRef.current = next;
      setStoredDisconnectedConnectors(next);
    },
    [setStoredDisconnectedConnectors],
  );

  const cleanupConnection = useCallback(
    (target: Connector) => {
      const pending = pendingDisconnectRef.current;
      if (pending?.id === target.id) {
        return pending.promise;
      }

      const promise: Promise<CleanupResult> = disconnectAsync({
        connector: target,
      })
        .then((): CleanupResult => {
          // Wagmi has removed the connection, nothing is left to hide.
          setConnectorDisconnected(target.id, false);
          return { success: true };
        })
        .catch((error): CleanupResult => {
          // Keep the connection hidden so it can't be silently re-selected.
          console.warn("[wagmi] Background wallet disconnect failed", error);
          return { success: false, error };
        })
        .finally(() => {
          if (pendingDisconnectRef.current?.promise === promise) {
            pendingDisconnectRef.current = null;
          }
        });
      pendingDisconnectRef.current = { id: target.id, promise };
      return promise;
    },
    [disconnectAsync, setConnectorDisconnected],
  );

  const disconnect = useCallback(async () => {
    if (!connector) {
      return;
    }
    setConnectorDisconnected(connector.id, true);
    autoCleanupUidsRef.current.add(connector.uid);
    void cleanupConnection(connector);
  }, [cleanupConnection, connector, setConnectorDisconnected]);

  // A connector disconnected before a reload (or whose cleanup failed) can be
  // restored by wagmi's reconnect; keep it hidden and finish the cleanup once.
  useEffect(() => {
    if (!connector || !isWagmiConnected || !isSuppressed) {
      return;
    }
    if (autoCleanupUidsRef.current.has(connector.uid)) {
      return;
    }
    autoCleanupUidsRef.current.add(connector.uid);
    void cleanupConnection(connector);
  }, [cleanupConnection, connector, isSuppressed, isWagmiConnected]);

  // Closing the drawer, a failed attempt, or unmounting aborts the request;
  // drop a connect still queued behind a cleanup so no prompt appears afterwards.
  useEffect(() => {
    const cancelQueuedConnect = () => {
      connectRequestIdRef.current += 1;
    };
    ee.on(WALLET_CONNECT_ABORTED, cancelQueuedConnect);
    return () => {
      cancelQueuedConnect();
      ee.off(WALLET_CONNECT_ABORTED, cancelQueuedConnect);
    };
  }, [ee]);

  const emitConnectError = useCallback(
    (error: unknown) => {
      ee.emit(WALLET_CONNECT_ERROR, {
        walletType: WalletConnectType.EVM,
        message: getWalletConnectErrorMessage(
          error,
          "Failed to connect to the wallet.",
        ),
      });
    },
    [ee],
  );

  const connectWithCallbacks = useCallback(
    (args: any) => {
      const targetId: string | undefined = args?.connector?.id;
      connectWagmi(args, {
        onSuccess: () => {
          if (targetId) {
            setConnectorDisconnected(targetId, false);
          }
        },
        onError: (error) => {
          if (isWalletConnectCancellation(error)) {
            ee.emit(WALLET_CONNECT_PROVIDER_CANCEL, {
              walletType: WalletConnectType.EVM,
            });
            return;
          }

          emitConnectError(error);
        },
      });
    },
    [connectWagmi, ee, emitConnectError, setConnectorDisconnected],
  );

  // A hidden connection still registered in wagmi means its earlier
  // cleanup failed; retry before reconnecting the same connector.
  const needsCleanup = useCallback(
    (target: Connector | undefined) =>
      !!target &&
      disconnectedConnectorsRef.current.includes(target.id) &&
      config.state.connections.has(target.uid),
    [config],
  );

  const connectAfterCleanup = useCallback(
    async (
      args: any,
      requestId: number,
      pending: Promise<CleanupResult> | undefined,
    ) => {
      const isActiveRequest = () => requestId === connectRequestIdRef.current;
      const target: Connector | undefined = args?.connector;

      // Finish the old session's cleanup before starting a new connection.
      await pending;
      if (!isActiveRequest()) {
        return;
      }
      if (needsCleanup(target)) {
        const result = await cleanupConnection(target!);
        if (!isActiveRequest()) {
          return;
        }
        if (result.success === false) {
          emitConnectError(result.error);
          return;
        }
      }
      connectWithCallbacks(args);
    },
    [cleanupConnection, connectWithCallbacks, emitConnectError, needsCleanup],
  );

  const connect = useCallback(
    (args: any) => {
      const requestId = ++connectRequestIdRef.current;
      const pending = pendingDisconnectRef.current?.promise;
      if (!pending && !needsCleanup(args?.connector)) {
        // Connect synchronously to keep the user gesture for wallet deep links.
        connectWithCallbacks(args);
        return;
      }
      void connectAfterCleanup(args, requestId, pending);
    },
    [connectAfterCleanup, connectWithCallbacks, needsCleanup],
  );

  return {
    connector,
    address,
    chainId,
    connectors: wagmiConnectors,
    isConnected,
    connect,
    disconnect,
  };
}
