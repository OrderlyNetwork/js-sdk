import { usePrivy, useSolanaWallets, useWallets } from "@privy-io/react-auth";
import { useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useMemo, useState } from "react";
import { ChainNamespace } from "@orderly.network/types";

export function usePrivyWallet() {
  const { login, logout, ready, authenticated } = usePrivy();
  const { wallets: walletsEVM } = useWallets();

  const { wallets: walletsSOL } = useSolanaWallets();
  const { connection } = useConnection();

  const [walletEVM, setWalletEVM] = useState<any>();
  const [walletSOL, setWalletSOL] = useState<any>();

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
    if (!walletsEVM || !walletsEVM[0]) {
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
            id: "1",
            namespace: ChainNamespace.evm,
          },
        ],
      });
    });
  }, [walletsEVM]);

  useEffect(() => {
    if (!walletsSOL || !walletsSOL[0]) {
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
      chain: [
        {
          id: "901901901",
          namespace: ChainNamespace.solana,
        },
      ],
    });
  }, [walletsSOL]);

  return { connect, walletEVM, walletSOL, isConnected};
}
