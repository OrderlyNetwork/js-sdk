import { useWagmiWallet } from "../providers/wagmi/wagmiWalletProvider";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSolanaWallet } from "../providers/solana/solanaWalletProvider";
import { usePrivyWallet } from "../providers/privy/privyWalletProvider";
import {
  AbstractChains,
  ChainNamespace,
  ConnectorKey,
  EnumTrackerKeys,
  TrackerListenerKeyMap,
} from "@orderly.network/types";
import {
  useLocalStorage,
  useStorageChain,
  useTrack,
  WalletState,
} from "@orderly.network/hooks";
import {
  ConnectProps,
  SolanaChains,
  WalletChainTypeEnum,
  WalletType,
} from "../types";
import { useWalletConnectorPrivy } from "../provider";
import { useAbstractWallet } from "../providers/abstractWallet/abstractWalletProvider";

export function useWallet() {
  const { track } = useTrack();
  const { walletChainType } = useWalletConnectorPrivy();
  const [connectorKey, setConnectorKey] = useLocalStorage(ConnectorKey, "");
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

  const {
    connect: connectAbstract,
    wallet: walletAbstract,
    connectedChain: connectedChainAbstract,
    isConnected: isConnectedAbstract,
    disconnect: disconnectAbstract,
  } = useAbstractWallet();
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [namespace, setNamespace] = useState<ChainNamespace | null>(null);
  const { storageChain, setStorageChain } = useStorageChain();
  const { setOpenConnectDrawer, setTargetNamespace } =
    useWalletConnectorPrivy();

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
      if (params.walletType === WalletType.ABSTRACT) {
        setConnectorKey(WalletType.ABSTRACT);
        connectAbstract();
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

  const [connectedChain, setConnectedChain] = useState<any>();

  const setChain = async (chain: {
    chainId: number | string;
  }): Promise<boolean | undefined> => {
    let tempNamespace: ChainNamespace = ChainNamespace.evm;
    if (
      Array.from(SolanaChains.values()).includes(
        parseInt(chain.chainId as string)
      )
    ) {
      tempNamespace = ChainNamespace.solana;
    }
    if (isPrivy) {
      if (tempNamespace === ChainNamespace.evm) {
        if (walletChainType === WalletChainTypeEnum.onlySOL) {
          return Promise.reject(new Error("No evm wallet found"));
        }
        isManual.current = true;
        return setChainPrivy(parseInt(chain.chainId as string))
          .then((res) => {
            track(EnumTrackerKeys.switchNetworkSuccess, {
              from_chain: storageChain?.chainId,
              to_chain: chain.chainId,
            });
            setStorageChain(parseInt(chain.chainId as string));

            return Promise.resolve(true);
          })
          .catch((e) => {
            console.log("xxxx switch network failed", {
              error: e,
            });
            return Promise.reject(e);
          });
      }

      if (tempNamespace === ChainNamespace.solana) {
        isManual.current = true;
        if (walletChainType === WalletChainTypeEnum.onlyEVM) {
          return Promise.reject(new Error("only evm wallet"));
        }
        if (privyWalletSOL) {
          setStorageChain(parseInt(chain.chainId as string));
          return Promise.resolve(true);
        } else {
          setOpenConnectDrawer(true);
          setTargetNamespace(ChainNamespace.solana);
          return Promise.reject(new Error("No solana wallet found"));
        }
      }
    } else {
      if (storageChain.namespace === ChainNamespace.evm) {
        // if current namespace is evm, switch chain
        if (tempNamespace === ChainNamespace.evm) {
          await setChainEvm(parseInt(chain.chainId as string));
          setStorageChain(parseInt(chain.chainId as string));
          track(EnumTrackerKeys.switchNetworkSuccess, {
            from_chain: storageChain?.chainId,
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
  };

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
  };

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
  };

  const setNullWalletStatus = () => {
    setWallet(null);
    setConnectedChain(null);
    setNamespace(null);
  };

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
        setConnectedChain(privyWalletEVM.chain);
        setNamespace(ChainNamespace.evm);
      } else {
        setNullWalletStatus();
      }
    }
    if (storageChain?.namespace === ChainNamespace.solana) {
      if (privyWalletSOL) {
        setWallet(privyWalletSOL);
        setConnectedChain(privyWalletSOL.chain);
        setNamespace(ChainNamespace.solana);
      } else {
        setNullWalletStatus();
      }
    }
  }, [connectorKey, privyWalletEVM, privyWalletSOL, storageChain]);

  useEffect(() => {
    if (connectorKey === WalletType.PRIVY) {
      return;
    }
    // handle non-privy wallet connect
    console.log("xxxx non-privy", {
      connectorKey,
      storageChain,
      walletEVM,
      walletSOL,
      walletAbstract,
      connectedChainAbstract,
      isConnectedAbstract,
    });

    if (storageChain?.namespace === ChainNamespace.evm) {
      if (AbstractChains.has(storageChain.chainId)) {
        if (isConnectedAbstract && walletAbstract) {
          setWallet(walletAbstract);
          setConnectedChain(connectedChainAbstract);
          setNamespace(ChainNamespace.evm);
        } else {
          setNullWalletStatus();
        }
      } else {
        if (isConnectedEVM && walletEVM) {
          setWallet(walletEVM);
          setConnectedChain(connectedChainEvm);
          setNamespace(ChainNamespace.evm);
        } else {
          setNullWalletStatus();
        }
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
  }, [
    connectorKey,
    storageChain,
    walletEVM,
    walletSOL,
    isConnectedEVM,
    isConnectedSOL,
    isConnectedAbstract,
    walletAbstract,
    connectedChainAbstract,
  ]);

  return {
    connect,
    wallet,
    connectedChain,
    setChain,
    namespace,
    switchWallet,
    disconnect,
  };
}
