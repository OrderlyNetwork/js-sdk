import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useKeyStore,
  useWalletConnector,
} from "@orderly.network/hooks";
import { parseChainIdToNumber } from "@orderly.network/utils";

export const useWalletStateHandle = () => {
  const { wallet: connectedWallet, connect } = useWalletConnector();
  const { account, state } = useAccount();
  const keyStore = useKeyStore();

  const localAddress = useMemo(() => keyStore.getAddress(), []);

  // current connected wallet address
  const currentWalletAddress = useMemo<string | undefined>(() => {
    return connectedWallet?.accounts?.[0]?.address;
  }, [connectedWallet]);

  // current connected chain id
  const currentChainId = useMemo<number | undefined>(() => {
    const id = connectedWallet?.chains?.[0]?.id;
    if (typeof id === "undefined") return id;
    return parseChainIdToNumber(id);
  }, [connectedWallet]);

  useEffect(() => {
    /**
     * if locale address is exist, resotre account state
     */
    if (localAddress && account.address !== localAddress) {
      connect({
        autoSelect: {
          label: "MetaMask",
          disableModals: true,
        },
      }).then(
        (res) => {
          console.log("silent connect wallet successed", res);
        },
        (error) => console.log("connect error", error)
      );
    }
  }, [localAddress]);

  /**
   * handle wallet connection
   */
  useEffect(() => {
    // if (!connectedWallet || currentWalletAddress === localAddress) return;

    /**
     * switch account
     */
    if (!!currentWalletAddress && currentWalletAddress !== account.address) {
      account.setAddress(currentWalletAddress, {
        provider: connectedWallet?.provider,
        chain: {
          id: currentChainId!,
        },
        wallet: {
          name: connectedWallet.label,
        },
      });
    }

    /**
     * switch chainId
     */
    if (currentChainId !== account.chainId) {
      account.switchChainId(currentChainId!);
    }
  }, [
    connectedWallet,
    currentWalletAddress,
    currentChainId,
    account.address,
    account.chainId,
  ]);

  // Check whether ChainId supports it
  useEffect(() => {
    if (!currentChainId) return;
  }, [currentChainId]);
};
