import { useWagmiWallet } from "../providers/wagmiWalletProvider";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSolanaWallet } from "../providers/solanaWalletProvider";
import { usePrivyWallet } from "../providers/privyWalletProvider";
import { ChainNamespace, ConnectorKey, EnumTrackerKeys, TrackerListenerKeyMap } from "@orderly.network/types";
import { useLocalStorage, useStorageChain, useTrack, WalletState } from "@orderly.network/hooks";
import { ConnectProps, SolanaChains, WalletType } from "../types";
import { useWalletConnectorPrivy } from "../provider";

export function useWallet() {
  const { track } = useTrack();
  const [connectorKey, setConnectorKey] = useLocalStorage(ConnectorKey, '')
  const {
    disconnect: disconnectEVM,
    connect: connectEVM,
    wallet: walletEVM,
    connectedChain: connectedChainEvm,
    setChain: setChainEvm,
    isConnected: isConnectedEVM,
  } = useWagmiWallet();
  const {
    disconnect: disconnectSOL,
    connect: connectSOL,
    wallet: walletSOL,
    isConnected: isConnectedSOL,
    connectedChain: connectedChainSOL,
  } = useSolanaWallet();
  const {
    disconnect: disconnectPrivy,
    connect: connectPrivy,
    walletSOL: privyWalletSOL,
    walletEVM: privyWalletEVM,
    isConnected: isConnectedPrivy,
    switchChain: setChainPrivy,
  } = usePrivyWallet();
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [namespace, setNamespace] = useState<ChainNamespace | null>(null);
  const { storageChain, setStorageChain } = useStorageChain();
  const { setOpenConnectDrawer, setTargetNamespace } = useWalletConnectorPrivy();

  const isManual = useRef<boolean>(false);


  const connect = (params: ConnectProps) => {

    setTargetNamespace(undefined);
    try {
      if (params.walletType === WalletType.EVM) {
        setConnectorKey(WalletType.EVM);
        connectEVM({ connector: params.connector! });
      }
      if (params.walletType === WalletType.SOL) {
        setConnectorKey(WalletType.SOL);
        connectSOL(params.walletAdapter!.name).then();
      }
      if (params.walletType === WalletType.PRIVY) {
        setConnectorKey(WalletType.PRIVY);
        connectPrivy();

      }
    } catch (e) {
      console.log("-- e", e);
    }
  };

  const isPrivy = useMemo(() => {
    if (connectorKey === WalletType.PRIVY) {
      return true;
    }
    return false;

  }, [connectorKey]);

  const [connectedChain, setConnectedChain] = useState<any>()

  const setChain = async (chain: { chainId: number | string }): Promise<boolean | undefined> => {
    let tempNamespace: ChainNamespace = ChainNamespace.evm;
    if (Array.from(SolanaChains.values()).includes(parseInt(chain.chainId as string))) {
      tempNamespace = ChainNamespace.solana;
    }
    if (isPrivy) {

      // TODO need check current namespace
      if (tempNamespace === ChainNamespace.evm) {
  
        isManual.current = true;
        return setChainPrivy(parseInt(chain.chainId as string)).then(res => {
      
          track(EnumTrackerKeys.switchNetworkSuccess, {
            from_chain: storageChain?.chainId,
            to_chain: chain.chainId,
          });
          setStorageChain(parseInt(chain.chainId as string));
         
        
          return Promise.resolve(true)

        }).catch(e => {
          console.log('xxxx switch network failed', {
            error: e,
          });
          return Promise.reject(e);
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
          await setChainEvm(parseInt(chain.chainId as string));
          setStorageChain(parseInt(chain.chainId as string));
          track(EnumTrackerKeys.switchNetworkSuccess, {
            from_chain: storageChain?.chain.id,
            to_chain: chain.chainId,
          });
          return Promise.resolve(true);
        }
        if (tempNamespace === ChainNamespace.solana) {
          if (isConnectedSOL && walletSOL) {
            setStorageChain(parseInt(chain.chainId as string));
          } else {
            setOpenConnectDrawer(true);
            setTargetNamespace(ChainNamespace.solana);
            return Promise.resolve(true);
          }
        }

      }
      if (storageChain.namespace === ChainNamespace.solana) {
        if (tempNamespace === ChainNamespace.evm) {
          if (isConnectedEVM && walletEVM) {
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
    const fromWallet = wallet?.accounts[0].address;
    let toWallet: string | undefined;
    if (isPrivy) {

      if (namespace === ChainNamespace.evm) {
        if (privyWalletEVM) {
          setStorageChain(privyWalletEVM.chain.id);
          toWallet = privyWalletEVM.accounts[0].address;
        }

      } else {
        if (privyWalletSOL) {
          setStorageChain(privyWalletSOL.chain.id);
          toWallet = privyWalletSOL.accounts[0].address;
        }
      }
    } else {
      if (namespace === ChainNamespace.evm) {
        if (walletEVM) {
          setStorageChain(walletEVM.chain.id);
          toWallet = walletEVM.accounts[0].address;
        }
      } else {
        if (walletSOL) {
          setStorageChain(walletSOL.chain.id);
          toWallet = walletSOL.accounts[0].address;
        }
      }
    }
    track(EnumTrackerKeys.clickSwitchWallet, {
      fromWallet,
      toWallet,
    });
  }

  const disconnect = async (walletType: WalletType) => {
    if (walletType === WalletType.PRIVY) {
      return await disconnectPrivy();
    }
    if (walletType === WalletType.EVM) {
      return disconnectEVM();
    }
    if (walletType === WalletType.SOL) {
      return disconnectSOL();
    }
  }

  const setNullWalletStatus = () => {
    setWallet(null);
    setConnectedChain(null);
    setNamespace(null);
  }



  useEffect(() => {
    // check current connector and chain form localstorage
    if (connectorKey !== WalletType.PRIVY) {
      return;
    }
    // console.log('xxxx connector privy', {
    //   connectorKey,
    //   storageChain,
    //   privyWalletEVM,
    //   privyWalletSOL
    // });

    if (storageChain?.namespace === ChainNamespace.evm) {
      if (privyWalletEVM) {
        setWallet(privyWalletEVM);
        setConnectedChain(privyWalletEVM.chain)
        setNamespace(ChainNamespace.evm);
      } else {
        setNullWalletStatus();

      }
    }
    if (storageChain?.namespace === ChainNamespace.solana) {
      if (privyWalletSOL) {
        setWallet(privyWalletSOL);
        setConnectedChain(privyWalletSOL.chain)
        setNamespace(ChainNamespace.solana);
      } else {
        setNullWalletStatus();
      }
    }




  }, [connectorKey, privyWalletEVM, privyWalletSOL, storageChain])

  useEffect(() => {
    if (connectorKey === WalletType.PRIVY) {
      return;
    }
    // handle non-privy wallet connect
    console.log('xxxx non-privy', {
      connectorKey,
      storageChain,
      walletEVM,
      walletSOL
    });

    if (storageChain?.namespace === ChainNamespace.evm) {
      if (isConnectedEVM && walletEVM) {
        setWallet(walletEVM);
        setConnectedChain(connectedChainEvm);
        setNamespace(ChainNamespace.evm);
      } else {
        setNullWalletStatus();
      }

    }
    if (storageChain?.namespace === ChainNamespace.solana) {
      if (isConnectedSOL && walletSOL) {
        setWallet(walletSOL);
        setConnectedChain(connectedChainSOL);
        setNamespace(ChainNamespace.solana);
      } else {
        setNullWalletStatus();
      }
    }

  }, [connectorKey, storageChain, walletEVM, walletSOL, isConnectedEVM, isConnectedSOL])


  return { connect, wallet, connectedChain, setChain, namespace, switchWallet, disconnect, };
}
