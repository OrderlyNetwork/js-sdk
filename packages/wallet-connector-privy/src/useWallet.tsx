import { useWagmiWallet } from "./useWagmiWallet";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSolanaWallet } from "./useSolanaWallet";
import { usePrivyWallet } from "./usePrivyWallet";
import { ChainNamespace, ConnectorKey } from "@orderly.network/types";
import { useLocalStorage, useStorageChain } from "@orderly.network/hooks";
import { ConnectProps, SolanaChains } from "./types";

export function useWallet() {
  const [connectorKey, setConnectorKey] = useLocalStorage(ConnectorKey, '')
  const {
    connect: connectEVM,
    wallet: walletEVM,
    connectedChain: connectedChainEvm,
    setChain: setChainEvm,
  } = useWagmiWallet();
  const {
    connect: connectSOL,
    wallet: walletSOL,
    connectedChain: connectedChainSOL,
  } = useSolanaWallet();
  const {
    connect: connectPrivy,
    walletSOL: privyWalletSOL,
    walletEVM: privyWalletEVM,
    switchChain: setChainPrivy,
  } = usePrivyWallet();
  const [wallet, setWallet] = useState<any>();
  const [namespace, setNamespace] = useState<ChainNamespace>(ChainNamespace.evm);
  const { storageChain, setStorageChain } = useStorageChain();

  const isManual = useRef<boolean>(false);


  const connect = (params: ConnectProps) => {
    console.log('--connect wallet', wallet);
    try {
      if (params.walletType === "EVM") {
        setConnectorKey('EVM');
        connectEVM({ connector: params.connector! });
      }
      if (params.walletType === 'SOL') {
        setConnectorKey('SOL');
        connectSOL(params.walletAdapter!.name).then();
      }
      if (params.walletType === 'privy') {
        setConnectorKey('privy')
        connectPrivy();

      }
    } catch (e) {
      console.log("-- e", e);
    }
  };

  const isPrivy = useMemo(() => {
    if (connectorKey === 'privy') {
      return true;
    }
    return false;

  }, [connectorKey]);

  const [connectedChain, setConnectedChain] = useState<any>()

  const setChain = (chain: { chainId: number | string }) => {
    if (isPrivy) {
      console.log('-- setchan privy', chain, setChainPrivy);
      let tempNamespace: ChainNamespace = ChainNamespace.evm;
      if (Array.from(SolanaChains.values()).includes(parseInt(chain.chainId as string))) {
        tempNamespace = ChainNamespace.solana;
      }
      // TODO need check current namespace
      if (tempNamespace === ChainNamespace.evm) {
        isManual.current = true;
        return setChainPrivy(parseInt(chain.chainId as string)).then(res => {
          console.log('-- privy switch chain res', res);
          setStorageChain(parseInt(chain.chainId as string));
          return Promise.resolve(true)

        })
      }

      if (tempNamespace === ChainNamespace.solana) {
        isManual.current = true;
        setStorageChain(parseInt(chain.chainId as string));
        return Promise.resolve(true);

      }

    }
  }

  const switchWallet = (namespace: ChainNamespace) => {
    // TODO need get chain from wallet
    if (isPrivy) {

      if (namespace === ChainNamespace.evm) {
        if (privyWalletEVM) {
          setStorageChain(privyWalletEVM.chain.id);
        }

      } else {
        if (privyWalletSOL) {
          setStorageChain(privyWalletSOL.chain.id);
        }
      }
    } else {
      if (namespace === ChainNamespace.evm) {
        if (walletEVM) {
          setStorageChain(walletEVM.chain.id);
        }
      } else {
        if (walletSOL) {
          setStorageChain(walletSOL.chain.id);
        }
      }
    }
  }



  useEffect(() => {
    // check current connector and chain form localstorage
    console.log('--- xxxxconnectorKey', connectorKey, storageChain);

    if (!connectorKey) {
      return;
    }

    if (connectorKey === 'privy') {
      if (storageChain?.namespace === ChainNamespace.evm) {
        if (privyWalletEVM) {
          setWallet(privyWalletEVM);
          setConnectedChain(privyWalletEVM.chain)
          setNamespace(ChainNamespace.evm);
        } else {
          setWallet(null);
          setConnectedChain(null);
        }
      }
      if (storageChain?.namespace === ChainNamespace.solana) {
        if (privyWalletSOL) {
          setWallet(privyWalletSOL);
          setConnectedChain(privyWalletSOL.chain)
          setNamespace(ChainNamespace.solana);
        } else {
          setWallet(null);
          setConnectedChain(null);
        }
      }
    } else {
      console.log('-- walletEVM', walletEVM);
      console.log('-- walletSOL', walletSOL);

      console.log('-- connectedChainEvm', connectedChainEvm);
      if (storageChain?.namespace === ChainNamespace.evm) {
        if (walletEVM) {
          setWallet(walletEVM);
          setConnectedChain(connectedChainEvm);
          setNamespace(ChainNamespace.evm);
        }

      }
      if (storageChain?.namespace === ChainNamespace.solana) {
        if (walletSOL) {
          setWallet(walletSOL);
          setConnectedChain(connectedChainSOL);
          setNamespace(ChainNamespace.solana);
        }
      }


    }


  }, [connectorKey, privyWalletEVM, privyWalletSOL, wallet, storageChain, walletEVM, walletSOL])


  return { connect, wallet, connectedChain, setChain, namespace, switchWallet };
}
