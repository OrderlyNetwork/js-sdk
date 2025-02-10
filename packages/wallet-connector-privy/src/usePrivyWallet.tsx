import { usePrivy, useSolanaWallets, useWallets } from "@privy-io/react-auth";
import { useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChainNamespace } from "@orderly.network/types";
import { int2hex } from "@orderly.network/utils/src";
import { Connection } from "@solana/web3.js";

const getPrivyEmbeddedWalletChainId = (chainId: string) => {
  if (!chainId) {
    return null;
  }
  return parseInt(chainId.split("eip155:")[1]);
};

export function usePrivyWallet() {
  const { login, logout, ready, authenticated, user } = usePrivy();
  const { wallets: walletsEVM } = useWallets();

  const {
    ready: solanaReady,
    wallets: walletsSOL,
    createWallet: createSolanaWallet,
  } = useSolanaWallets();
  // const { connection } = useConnection();
  // mainnetRpc: 'https://camilla-zmlqv1-fast-mainnet.helius-rpc.com',
  // devnetRpc: 'https://caryl-ukn4ci-fast-devnet.helius-rpc.com',
  const connection = useMemo(() => {

    return new Connection('https://caryl-ukn4ci-fast-devnet.helius-rpc.com');
    
  }, [])

  const [walletEVM, setWalletEVM] = useState<any>();
  const [walletSOL, setWalletSOL] = useState<any>();

  
  const linkedAccount = useMemo(() => {
    if (user && user.linkedAccounts) {
      const account = user.linkedAccounts[0];
      return {
        type: account.type,
        address: 'number' in account ? account.number : ('address' in account ? account.address : null),
      }
    }
    return null;
  }, [user]);


  const switchChain = (chainId: number) => {
    const wallet = walletsEVM[0];
    if (wallet) {
      return wallet.switchChain(chainId).then(res => {
        console.log('switch chain res', res);
        
      });
    }
    return Promise.reject("no wallet");
  };

  const connect = () => {
    login();
  };

  const isConnected = useMemo(() => {
    if (ready && authenticated) {
      return true;
    }
    return false;
  }, [ready, authenticated]);

  useEffect(() => {
    if (!authenticated || !walletsEVM || !walletsEVM[0]) {
      setWalletEVM(null);
      return;
    }
    const wallet = walletsEVM[0];
    wallet.getEthereumProvider().then((provider: any) => {
      setWalletEVM({
        label: "privy",
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
        chain: {
          id: getPrivyEmbeddedWalletChainId(wallet.chainId),
          namespace: ChainNamespace.evm,
        },
      });
    });
  }, [walletsEVM, authenticated]);

  useEffect(() => {
    if (!authenticated) {
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
        signTransaction: wallet.signTransaction,
        connection,

        sendTransaction: wallet.sendTransaction,
      },
      accounts: [
        {
          address: wallet.address,
        },
      ],
      chains: [
        {
          id: 901901901,
          namespace: ChainNamespace.solana,
        },
      ],
      chain: {
        id: 901901901,
        namespace: ChainNamespace.solana,
      },
    });
  }, [walletsSOL, authenticated, createSolanaWallet, connection, solanaReady]);

  return { connect, walletEVM, walletSOL, isConnected, logout, switchChain, linkedAccount };
}
