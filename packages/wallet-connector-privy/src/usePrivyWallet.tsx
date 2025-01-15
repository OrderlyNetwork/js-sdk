import { usePrivy, useSolanaWallets, useWallets } from "@privy-io/react-auth";
import { useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChainNamespace } from "@orderly.network/types";
import { int2hex } from "@orderly.network/utils/src";

const getPrivyEmbeddedWalletChainId = (chainId: string) => {
  if (!chainId) {
   return null;
  }
  return chainId.split("eip155:")[1]
}

export function usePrivyWallet() {
  const { login, logout, ready, authenticated } = usePrivy();
  const { wallets: walletsEVM } = useWallets();


  const {ready: solanaReady, wallets: walletsSOL, createWallet: createSolanaWallet } = useSolanaWallets();
  const { connection } = useConnection();

  const [walletEVM, setWalletEVM] = useState<any>();
  const [walletSOL, setWalletSOL] = useState<any>();

  const switchChain = (chainId: number) => {
    const wallet = walletsEVM[0];
    if (wallet) {

      return wallet.switchChain(chainId)
    }
    return Promise.reject('no wallet')

  }


  const connect = () => {
    login();
  };

  const isConnected = useMemo(() => {
    if (ready && authenticated) {
      return true;
    }
    return false;

  }, [ready, authenticated])

  useEffect(() => {
    if (!authenticated || !walletsEVM || !walletsEVM[0]) {
      setWalletEVM(null);
      return;
    }
    const wallet = walletsEVM[0];
    wallet.getEthereumProvider().then((provider) => {
      setWalletEVM({
        label:  "privy" ,
        icon: "",
        provider: provider,
        accounts: [
          {
            address: wallet.address,
          },
        ],
        chains: [
          {
            id: getPrivyEmbeddedWalletChainId(wallet.chainId),
            namespace: ChainNamespace.evm,
          },
        ],
      });
    });
  }, [walletsEVM, authenticated]);

  useEffect(() => {
    if(!authenticated) {
      setWalletSOL(null);
     return;
    }
    if (!solanaReady) {
      return;
    }
    if (!walletsSOL || !walletsSOL[0]) {
      createSolanaWallet().then();

      return;
    }
    const wallet = walletsSOL[0];
    setWalletSOL({
      label: "privy",
      icon: "",
      provider: {
        signMessage: wallet.signMessage,
        connection,

        sendTransaction: wallet.signTransaction,
      },
      accounts: [
        {
          address: wallet.address,
        },
      ],
      chains: [
        {
          id: "901901901",
          namespace: ChainNamespace.solana,
        },
      ],
    });
  }, [walletsSOL, authenticated, createSolanaWallet, connection, solanaReady]);

  return { connect, walletEVM, walletSOL, isConnected, logout, switchChain};
}
