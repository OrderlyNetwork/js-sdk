import { useMemo } from "react";
import type { ConnectOptions, OnboardAPI } from "@web3-onboard/core";
import {
  useAppState,
  useConnectWallet,
  useSetChain,
} from "@web3-onboard/react";
import { useSimpleDI } from "@orderly.network/hooks";
import {
  setBinanceConnectChain,
  withBinanceConnectChain,
} from "./binanceConnectChain";

// Onboard's ConnectOptions does not accept a connect-time chainId.
// This local field controls Binance's initial chain selection and is
// removed before forwarding options to Onboard.
type EvmConnectOptions = ConnectOptions & { chainId?: number | string };

export function useEvm() {
  const [
    {
      wallet, // the wallet that has been connected or null if not yet connected
      connecting, // boolean indicating if connection is in progress
    },
    connectWallet, // function to call to initiate user to connect wallet
    evmDisconnect, // function to call with wallet<DisconnectOptions> to disconnect wallet
    updateBalances, // function to be called with an optional array of wallet addresses connected through Onboard to update balance or empty/no params to update all connected wallets
    setWalletModules, // function to be called with an array of wallet modules to conditionally allow connection of wallet types i.e. setWalletModules([ledger, trezor, injected])
    setPrimaryWallet, // function that can set the primary wallet and/or primary account within that wallet. The wallet that is set needs to be passed in for the first parameter and if you would like to set the primary account, the address of that account also needs to be passed in
  ] = useConnectWallet();

  const walletModules = useAppState("walletModules");
  const { get } = useSimpleDI<OnboardAPI>();

  const connect = (options?: EvmConnectOptions) => {
    // Store the requested chain for Binance's lazy interface initialization.
    const getChainId = setBinanceConnectChain(
      get("onboardAPI"),
      options?.chainId,
    );
    // Also cover modules already registered on external Onboard instances.
    // Known limitation: if an external instance still has no walletModules,
    // connectWallet() lazily loads its original initializers after this mapping,
    // so Binance's provider may still initialize from the first configured chain.
    // SDK-managed initialization avoids this via initWithBinanceConnectChain(),
    // including custom wallets passed through evmInitial.options.wallets.
    // Current consumers use that SDK-managed path. Revisit this limitation if
    // a consumer adopts external initialization with lazy wallet modules.
    const modules = walletModules.map((walletModule) =>
      withBinanceConnectChain(walletModule, getChainId ?? options?.chainId),
    );
    if (
      modules.some(
        (walletModule, index) => walletModule !== walletModules[index],
      )
    ) {
      setWalletModules(modules.map((walletModule) => () => walletModule));
    }

    // Only autoSelect is forwarded; the chainId was consumed above.
    return connectWallet(
      options?.autoSelect ? { autoSelect: options.autoSelect } : undefined,
    );
  };

  const [
    {
      chains, // the list of chains that web3-onboard was initialized with
      connectedChain: evmConnectChain, // the current chain the user's wallet is connected to
      settingChain, // boolean indicating if the chain is in the process of being set
    },
    setChain, // function to call to initiate user to switch chains in their wallet
  ] = useSetChain();

  const connected = useMemo(() => {
    return !!(
      wallet &&
      wallet.accounts &&
      wallet.accounts[0] &&
      wallet.accounts[0].address
    );
  }, [wallet]);

  const disconnect = async () => {
    console.log("-- disconnect evm xxxxxxxxxxxx");
    if (!wallet) {
      return;
    }
    return evmDisconnect({
      label: wallet.label,
    });
  };

  const connectedChain = useMemo(() => {
    return evmConnectChain
      ? { ...evmConnectChain, id: parseInt(evmConnectChain.id) }
      : null;
  }, [evmConnectChain]);

  const changeChain = (chain: { chainId: string }): Promise<any> => {
    return setChain(chain);
  };

  return {
    connect,
    connected,
    disconnect,
    connecting,
    wallet,
    connectedChain,
    changeChain,
  };
}
