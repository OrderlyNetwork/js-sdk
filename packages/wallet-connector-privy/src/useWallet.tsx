import { useWagmiWallet } from "./useWagmiWallet";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSolanaWallet } from "./useSolanaWallet";
import { usePrivyWallet } from "./usePrivyWallet";
import { ChainNamespace, ConnectorKey } from "@orderly.network/types";
import { useLocalStorage, useStorageChain } from "@orderly.network/hooks";
import { ConnectProps, SolanaChains } from "./types";
import { useWalletConnectorPrivy } from "./provider";

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
  const { setOpenConnectDrawer, setTargetNamespace } = useWalletConnectorPrivy();

  const isManual = useRef<boolean>(false);


  const connect = (params: ConnectProps) => {

    setTargetNamespace(undefined);
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
    let tempNamespace: ChainNamespace = ChainNamespace.evm;
    if (Array.from(SolanaChains.values()).includes(parseInt(chain.chainId as string))) {
      tempNamespace = ChainNamespace.solana;
    }
    if (isPrivy) {
      console.log('-- setchan privy', chain, setChainPrivy);

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

    } else {
      if (storageChain.namespace === ChainNamespace.evm) {
        // if current namespace is evm, switch chain
        if (tempNamespace === ChainNamespace.evm) {
          setChainEvm(parseInt(chain.chainId as string));
          setStorageChain(parseInt(chain.chainId as string));
        }
        if (tempNamespace === ChainNamespace.solana) {
          if (walletSOL) {
            setStorageChain(parseInt(chain.chainId as string));
          } else {
            setOpenConnectDrawer(true);
            setTargetNamespace(ChainNamespace.solana);
          }
        }

      }
      if (storageChain.namespace === ChainNamespace.solana) {
        if (tempNamespace === ChainNamespace.evm) {
          if (walletEVM) {
            setStorageChain(parseInt(chain.chainId as string));
          } else {
            setOpenConnectDrawer(true);
            setTargetNamespace(ChainNamespace.evm);
          }
        }
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
    if (connectorKey !== 'privy') {
      return;
    }
    console.log('xxxx connector privy', {
      connectorKey,
      storageChain,
      privyWalletEVM,
      privyWalletSOL
    });

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




  }, [connectorKey, privyWalletEVM, privyWalletSOL, storageChain])

  useEffect(() => {
    if (connectorKey !== 'EVM' && connectorKey !== 'SOL') {
      return;
    }
    // handle non-privy wallet connect
    console.log('xxxx connector non-privy', {
      connectorKey,
      storageChain,
      walletEVM,
      walletSOL
    });

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

  }, [connectorKey, storageChain, walletEVM, walletSOL])


  return { connect, wallet, connectedChain, setChain, namespace, switchWallet };
}
