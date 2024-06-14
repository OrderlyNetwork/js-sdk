import { useEffect, useMemo } from "react";
import {
  useAccount,
  useKeyStore,
  useWalletConnector,
} from "@orderly.network/hooks";
import { parseChainIdToNumber } from "@orderly.network/utils";

export const useWalletStateHandle = () => {
  const { wallet: connectedWallet } = useWalletConnector();
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

  // useEffect(() => {
  //   account.on("change:status", (state) => {
  //     console.info("account status changed", state);
  //   });

  //   return () => {
  //     account.off("change:status");
  //   };
  // }, [account]);

  useEffect(() => {
    /**
     * if locale address is exist, resotre account state
     */
    if (
      localAddress &&
      account.address !== localAddress &&
      typeof (window as any).ethereum !== "undefined"
    ) {
      /**
       * get chainId from ethereum provider
       */
      window.ethereum
        .request({
          method: "eth_chainId",
          params: [],
        })
        .then(
          (chainId: string) => {
            console.log("chainId", chainId, parseChainIdToNumber(chainId));
            account.setAddress(localAddress, {
              provider: (window as any).ethereum,
              chain: {
                id: parseChainIdToNumber(chainId),
              },
              wallet: {
                name: "MetaMask",
              },
            });
          },
          (error: any) => {
            console.error("request chainId failed:", error);
          }
        );
    }
  }, [localAddress]);

  /**
   * handle wallet connection
   */
  useEffect(() => {
    if (!connectedWallet || currentWalletAddress === localAddress) return;

    /**
     * switch account
     */
    if (currentWalletAddress && currentWalletAddress !== account.address) {
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
};
