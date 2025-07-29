import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useLocalStorage,
  useStorageChain,
  useTrack,
  WalletState,
} from "@orderly.network/hooks";
import {
  AbstractChains,
  ChainNamespace,
  ConnectorKey,
  TrackerEventName,
} from "@orderly.network/types";
import { useWalletConnectorPrivy } from "../provider";
import { useAbstractWallet } from "../providers/abstractWallet/abstractWalletProvider";
import { usePrivyWallet } from "../providers/privy/privyWalletProvider";
import { useSolanaWallet } from "../providers/solana/solanaWalletProvider";
import { useWagmiWallet } from "../providers/wagmi/wagmiWalletProvider";
import { ConnectProps, WalletConnectType, WalletType } from "../types";
import { getChainType } from "../util";

export function useWallet() {
  const { track } = useTrack();
  const { walletChainTypeConfig } = useWalletConnectorPrivy();
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
  const [walletType, setWalletType] = useState<WalletConnectType | null>(null);
  const { storageChain, setStorageChain } = useStorageChain();
  const { setOpenConnectDrawer, targetWalletType, setTargetWalletType } =
    useWalletConnectorPrivy();

  const isManual = useRef<boolean>(false);

  const connect = (params: ConnectProps) => {
    setTargetWalletType(undefined);
    try {
      if (params.walletType === WalletConnectType.EVM) {
        setConnectorKey(WalletConnectType.EVM);
        connectEVM({ connector: params.connector! });
      }
      if (params.walletType === WalletConnectType.SOL) {
        setConnectorKey(WalletConnectType.SOL);
        connectSOL(params.walletAdapter!.name).then();
      }
      if (params.walletType === WalletConnectType.PRIVY) {
        setConnectorKey(WalletConnectType.PRIVY);
        connectPrivy();
      }
      if (params.walletType === WalletConnectType.ABSTRACT) {
        setConnectorKey(WalletConnectType.ABSTRACT);
        connectAbstract();
      }
    } catch (e) {
      console.log("-- e", e);
    }
  };

  const isPrivy = useMemo(() => {
    if (connectorKey === WalletConnectType.PRIVY) {
      return true;
    }
    return false;
  }, [connectorKey]);

  const [connectedChain, setConnectedChain] = useState<any>();

  const setChain = async (chain: {
    chainId: number | string;
  }): Promise<boolean | undefined> => {
    const chainType = getChainType(parseInt(chain.chainId as string));

    if (isPrivy) {
      if (chainType === WalletType.EVM) {
        if (!walletChainTypeConfig.hasEvm) {
          return Promise.reject(new Error("No evm wallet found"));
        }
        isManual.current = true;
        return setChainPrivy(parseInt(chain.chainId as string))
          .then((res) => {
            track(TrackerEventName.switchNetworkSuccess, {
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
      // current privy not support abstract chain
      if (chainType === WalletType.ABSTRACT) {
        setOpenConnectDrawer(true);
        setTargetWalletType(WalletType.ABSTRACT);
      }

      if (chainType === WalletType.SOL) {
        isManual.current = true;
        if (!walletChainTypeConfig.hasSol) {
          return Promise.reject(new Error("No solana wallet found"));
        }
        if (privyWalletSOL) {
          setStorageChain(parseInt(chain.chainId as string));
          return Promise.resolve(true);
        } else {
          setOpenConnectDrawer(true);
          setTargetWalletType(WalletType.SOL);
          return Promise.reject(new Error("No solana wallet found"));
        }
      }
    } else {
      // if current namespace is evm, switch chain
      if (chainType === WalletType.EVM) {
        if (isConnectedEVM && walletEVM) {
          await setChainEvm(parseInt(chain.chainId as string));
          setStorageChain(parseInt(chain.chainId as string));
          track(TrackerEventName.switchNetworkSuccess, {
            from_chain: storageChain?.chainId,
            to_chain: chain.chainId,
          });
        } else {
          setOpenConnectDrawer(true);
          setTargetWalletType(WalletType.EVM);
          return Promise.resolve(true);
        }

        return Promise.resolve(true);
      }
      if (chainType === WalletType.SOL) {
        if (isConnectedSOL && walletSOL) {
          setStorageChain(parseInt(chain.chainId as string));
        } else {
          setOpenConnectDrawer(true);
          setTargetWalletType(WalletType.SOL);
          return Promise.resolve(true);
        }
      }
      if (chainType === WalletType.ABSTRACT) {
        if (isConnectedAbstract && walletAbstract) {
          setStorageChain(parseInt(chain.chainId as string));
          return Promise.resolve(true);
        } else {
          setOpenConnectDrawer(true);
          // TODO need send abstract type
          setTargetWalletType(WalletType.ABSTRACT);
          return Promise.reject(new Error("No abstract wallet found"));
        }
      }
    }
  };

  const switchWallet = (walletType: WalletType) => {
    const fromWallet = wallet?.accounts[0].address;
    let toWallet: string | undefined;
    if (isPrivy) {
      switch (walletType) {
        case WalletType.EVM:
          if (privyWalletEVM) {
            setStorageChain(privyWalletEVM.chain.id);
            toWallet = privyWalletEVM.accounts[0].address;
          }
          break;
        case WalletType.SOL:
          if (privyWalletSOL) {
            setStorageChain(privyWalletSOL.chain.id);
            toWallet = privyWalletSOL.accounts[0].address;
          }
          break;
        case WalletType.ABSTRACT:
          // privy don't support abstract wallet
          break;
      }
    } else {
      switch (walletType) {
        case WalletType.EVM:
          if (walletEVM) {
            setStorageChain(walletEVM.chain.id);
            toWallet = walletEVM.accounts[0].address;
          }
          break;
        case WalletType.SOL:
          if (walletSOL) {
            setStorageChain(walletSOL.chain.id);
            toWallet = walletSOL.accounts[0].address;
          }
          break;
        case WalletType.ABSTRACT:
          if (walletAbstract) {
            setStorageChain(walletAbstract.chain!.id);
            toWallet = walletAbstract.accounts[0].address;
          }
          break;
      }
    }
    track(TrackerEventName.clickSwitchWallet, {
      fromWallet,
      toWallet,
    });
  };

  const disconnect = async (walletType: WalletConnectType) => {
    switch (walletType) {
      case WalletConnectType.PRIVY:
        return await disconnectPrivy();
      case WalletConnectType.EVM:
        return disconnectEVM();
      case WalletConnectType.SOL:
        return disconnectSOL();
      case WalletConnectType.ABSTRACT:
        return disconnectAbstract();
    }
  };

  const onDisconnect = (parmas: any): Promise<any> => {
    if (!walletType) {
      throw new Error("No wallet type found");
    }
    return new Promise((resolve, reject) => {
      disconnect(walletType)
        .then(() => {
          resolve(true);
        })
        .catch((e) => {
          reject(e);
        });
    });
  };

  const setNullWalletStatus = () => {
    setWallet(null);
    setWalletType(null);
    setConnectedChain(null);
    setNamespace(null);
  };

  useEffect(() => {
    // check current connector and chain form localstorage
    if (connectorKey !== WalletConnectType.PRIVY) {
      return;
    }
    // console.log('xxxx connector privy', {
    //   connectorKey,
    //   storageChain,
    //   privyWalletEVM,
    //   privyWalletSOL
    // });

    if (storageChain?.namespace === ChainNamespace.evm) {
      if (AbstractChains.has(storageChain.chainId)) {
        return setNullWalletStatus();
      }
      if (privyWalletEVM) {
        setWallet(privyWalletEVM);
        setWalletType(WalletConnectType.PRIVY);
        setConnectedChain(privyWalletEVM.chain);
        setNamespace(ChainNamespace.evm);
      } else {
        setNullWalletStatus();
      }
    }
    if (storageChain?.namespace === ChainNamespace.solana) {
      if (privyWalletSOL) {
        setWallet(privyWalletSOL);
        setWalletType(WalletConnectType.PRIVY);
        setConnectedChain(privyWalletSOL.chain);
        setNamespace(ChainNamespace.solana);
      } else {
        setNullWalletStatus();
      }
    }
  }, [connectorKey, privyWalletEVM, privyWalletSOL, storageChain]);

  useEffect(() => {
    if (connectorKey === WalletConnectType.PRIVY) {
      return;
    }
    // handle non-privy wallet connect
    // console.log("xxxx non-privy", {
    //   connectorKey,
    //   storageChain,
    //   walletEVM,
    //   walletSOL,
    //   walletAbstract,
    //   connectedChainAbstract,
    //   isConnectedAbstract,
    // });

    if (storageChain?.namespace === ChainNamespace.evm) {
      if (AbstractChains.has(storageChain.chainId)) {
        if (isConnectedAbstract && walletAbstract) {
          setWallet(walletAbstract);
          setWalletType(WalletConnectType.ABSTRACT);
          setConnectedChain(connectedChainAbstract);
          setNamespace(ChainNamespace.evm);
        } else {
          setNullWalletStatus();
        }
      } else {
        if (isConnectedEVM && walletEVM) {
          setWallet(walletEVM);
          setWalletType(WalletConnectType.EVM);
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
        setWalletType(WalletConnectType.SOL);
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
    onDisconnect,
  };
}
