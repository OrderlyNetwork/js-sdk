import { LinkedAccountWithMetadata, usePrivy, useSolanaWallets, useWallets, WalletWithMetadata } from "@privy-io/react-auth";
import { useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChainNamespace, SolanaChains } from "@orderly.network/types";
import { int2hex } from "@orderly.network/utils/src";
import { Connection } from "@solana/web3.js";
import { WalletState } from "@orderly.network/hooks";
import { useWalletConnectorPrivy } from "../provider";
import { SolanaChainsMap } from "../types";

interface WalletStatePrivy extends WalletState {
  chain: {
    id: number;
    namespace: ChainNamespace;
  }
}


const getPrivyEmbeddedWalletChainId = (chainId: string) => {
  if (!chainId) {
    return null;
  }
  return parseInt(chainId.split("eip155:")[1]);
};

interface PrivyWalletHook {
  connect: () => void;
  walletEVM: WalletStatePrivy | null;
  walletSOL: WalletStatePrivy | null;
  isConnected: boolean;
  switchChain: (chainId: number) => Promise<any>;
  linkedAccount: { type: string; address: string | null } | null;
  exportWallet: any;
  disconnect: () => Promise<void>;
}

export function usePrivyWallet(): PrivyWalletHook {
  const { network } = useWalletConnectorPrivy();
  const { login, logout, ready, authenticated, user, exportWallet: exportEvmWallet } = usePrivy();
  const { wallets: walletsEVM } = useWallets();

  const {
    ready: solanaReady,
    wallets: walletsSOL,
    createWallet: createSolanaWallet,
    exportWallet: exportSolanaWallet,
  } = useSolanaWallets();
  const connection = useMemo(() => {

    return new Connection('https://caryl-ukn4ci-fast-devnet.helius-rpc.com');

  }, [])

  const [walletEVM, setWalletEVM] = useState<WalletStatePrivy | null>(null);
  const [walletSOL, setWalletSOL] = useState<WalletStatePrivy | null>(null);


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
      return wallet.switchChain(chainId)
    }
    return Promise.reject("no wallet");
  };

  const connect = () => {
    login();
  };

  const disconnect = () => {
    return logout();
  }

  const exportWallet = (namespace: ChainNamespace) => {
    if (namespace === ChainNamespace.evm) {
      return exportEvmWallet();
    } else if (namespace === ChainNamespace.solana) {
      return exportSolanaWallet();
    }
    return Promise.reject("no namespace");
  }

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
            id: getPrivyEmbeddedWalletChainId(wallet.chainId) ?? 1,
            namespace: ChainNamespace.evm,
          },
        ],
        chain: {
          id: getPrivyEmbeddedWalletChainId(wallet.chainId) ?? 1,
          namespace: ChainNamespace.evm,
        },

      });
    });
  }, [walletsEVM, authenticated]);

  useEffect(() => {
    // console.log('Solana wallet effect triggered:', {
    //   authenticated,
    //   solanaReady,
    //   user,
    //   walletsSOL,
    // });
    if (!authenticated) {
      setWalletSOL(null);
      return;
    }
    if (!solanaReady) {
      return;
    }
    if (!user) {
      return;
    }
    const embededSolanaWallet = (user?.linkedAccounts as WalletWithMetadata[]).find(
      (item: WalletWithMetadata) => item.chainType === 'solana' && item.connectorType === 'embedded'
    );

    if (!embededSolanaWallet) {
      createSolanaWallet().then();
      return;
    }

    if (!walletsSOL || !walletsSOL[0]) {
      return;
    }

    const wallet = walletsSOL.find((w: any) => w.connectorType === 'embedded');
    if (wallet) {
      if (walletSOL && wallet.address === walletSOL.accounts[0].address) {
        if (walletSOL.chain.id === SolanaChainsMap.get(network)!) {
          return;
        }
      }
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
            id: SolanaChainsMap.get(network)!,
            namespace: ChainNamespace.solana,
          },
        ],
        chain: {
          id: SolanaChainsMap.get(network)!,
          namespace: ChainNamespace.solana,
        },
      });
    }


  }, [walletsSOL, authenticated, createSolanaWallet, connection, solanaReady, user, walletSOL, network]);




  return { connect, walletEVM, walletSOL, isConnected, disconnect, switchChain, linkedAccount, exportWallet };
}
