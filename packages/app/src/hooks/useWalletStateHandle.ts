import { useContext, useEffect, useMemo, useState } from "react";
import {
  OrderlyContext,
  useAccount,
  useChains,
  useKeyStore,
  useWalletConnector,
} from "@orderly.network/hooks";
import { parseChainIdToNumber } from "@orderly.network/utils";
import { API } from "@orderly.network/types";

function checkChainSupport(chainId: number | string, chains: API.Chain[]) {
  if (typeof chainId === "string") {
    chainId = parseInt(chainId);
  }
  return chains.some((chain) => {
    return chain.network_infos.chain_id === chainId;
  });
}

export const useWalletStateHandle = () => {
  const {
    wallet: connectedWallet,
    connect,
    connectedChain,
  } = useWalletConnector();
  const { account, state } = useAccount();
  const keyStore = useKeyStore();
  const { networkId } = useContext<any>(OrderlyContext);
  const [chains] = useChains();
  const [unsupported, setUnsupported] = useState(true);

  const localAddress = useMemo<string>(() => keyStore.getAddress(), []);

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
    if (!connectedChain) return;

    let isSupported = checkChainSupport(
      connectedChain.id,
      networkId === "testnet" ? chains.testnet : chains.mainnet
    );

    setUnsupported(!isSupported);
  }, [connectedChain?.id, chains]);

  useEffect(() => {
    if (unsupported) return;

    /**
     * if locale address is exist, restore account state
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
  }, [localAddress, unsupported]);

  /**
   * handle wallet connection
   */
  useEffect(() => {
    //
    if (unsupported) return;
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
    connectedChain,
    currentWalletAddress,
    currentChainId,
    account.address,
    account.chainId,
    unsupported,
  ]);
};
