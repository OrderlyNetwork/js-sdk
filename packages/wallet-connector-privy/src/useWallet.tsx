import { useWagmiWallet } from "./useWagmiWallet";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSoalanWallet } from "./useSoalanWallet";
import { usePrivyWallet } from "./usePrivyWallet";
import { ChainNamespace } from "@orderly.network/types";
import {useLocalStorage} from "@orderly.network/hooks";

const ConnectorKey = 'ConnectorKey';
export function useWallet() {
  const [connectorKey, setConnectorKey]= useLocalStorage(ConnectorKey, '')
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
  } = useSoalanWallet();
  const {
    connect: connectPrivy,
    walletSOL: privyWalletSOL,
    walletEVM: privyWalletEVM,
    switchChain: setChainPrivy,
  } = usePrivyWallet();
  const [wallet, setWallet] = useState<any>();

  // current target connector and namespace
  const targetConnector= useRef<any>(null)
  const targetChainNamespace = useRef<any>(null);

  const connect = (type: any, wallet: any) => {
    console.log('--connect wallet', wallet);
    try {
      if (type === "EVM") {
        connectEVM({ connector: wallet });
      }
      if (type === 'SOL') {
        connectSOL(wallet.name).then();
      }
      if (type === 'privy') {
        targetChainNamespace.current = ChainNamespace.evm;
        targetConnector.current = 'privy';
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

  const setChain = (chain:{chainId: number | string}) => {
    if (isPrivy) {
      console.log('-- setchan privy', chain, setChainPrivy);
      return setChainPrivy(parseInt(chain.chainId as string)).then(res => {
        console.log('-- privy switch chain res', res);
        return Promise.resolve(true)

      })

    }
    return setChainEvm(parseInt(chain.chainId as string));

  }

  useEffect(() => {
    if (targetConnector.current === 'privy') {
      if (targetChainNamespace.current === ChainNamespace.evm) {
        if (privyWalletEVM) {
          setConnectorKey('privy')


          setWallet(privyWalletEVM);
          setConnectedChain(privyWalletEVM.connectedChain);
        }
      } else {
        if (privyWalletSOL) {
          setConnectorKey('privy')
          setWallet(privyWalletSOL)
        }
      }
    }
  }, [privyWalletEVM, privyWalletSOL])

  // useEffect(() => {
  //   if (targetConnector.current === 'wagmi') {
  //     if (targetChainNamespace.current === ChainNamespace.evm) {
  //       setWallet(walletEVM);
  //     } else {
  //       setWallet(walletSOL)
  //     }
  //   }
  // }, [walletEVM, walletSOL]);

  useEffect(() =>{
    // check current connector and chain form localstorage
    if (!connectorKey) {
     return;
    }
    // mark as reload
    if (targetConnector.current) {
     return;
    }
    console.log('-- setwallet', connectorKey);
    if (wallet) {
      return;
    }
    if (connectorKey === 'privy') {
      // if (privyWalletEVM) {
      //   setWallet(privyWalletEVM);
      //   setConnectedChain(privyWalletEVM.chains[0])
      // }
      if (privyWalletSOL) {
        console.log('-- privy SOL wallet', privyWalletSOL);
          setWallet(privyWalletSOL);
          setConnectedChain(privyWalletSOL.chains[0])

      }
    }

  }, [connectorKey, privyWalletEVM, privyWalletSOL, wallet])


  return { connect, wallet, connectedChain, setChain };
}
