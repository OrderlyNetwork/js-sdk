import { useWagmiWallet } from "./useWagmiWallet";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSoalanWallet } from "./useSoalanWallet";
import { usePrivyWallet } from "./usePrivyWallet";
import { ChainNamespace } from "@orderly.network/types";
import { useLocalStorage } from "@orderly.network/hooks";
import { ConnectProps, SolanaChains } from "./types";

const ConnectorKey = 'ConnectorKey';
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
  } = useSoalanWallet();
  const {
    connect: connectPrivy,
    walletSOL: privyWalletSOL,
    walletEVM: privyWalletEVM,
    switchChain: setChainPrivy,
  } = usePrivyWallet();
  const [wallet, setWallet] = useState<any>();
  const [namespace, setNamespace] = useState<ChainNamespace>(ChainNamespace.evm);

  const isManual = useRef<boolean>(false);


  const connect = (params: ConnectProps) => {
    console.log('--connect wallet', wallet);
    try {
      if (params.walletType === "EVM") {
        connectEVM({ connector: wallet });
      }
      if (params.walletType === 'SOL') {
        connectSOL(wallet.name).then();
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
      // todo need check current namespace
      if (tempNamespace === ChainNamespace.evm) {
        isManual.current = true;
        setWallet(privyWalletEVM);
        return setChainPrivy(parseInt(chain.chainId as string)).then(res => {
          console.log('-- privy switch chain res', res);
        setConnectedChain(privyWalletEVM.chain)
          return Promise.resolve(true)

        })
      }

      if (tempNamespace === ChainNamespace.solana) {
        isManual.current = true;
        setWallet(privyWalletSOL);
        setConnectedChain(privyWalletSOL.chain)
        return Promise.resolve();

      }
      return setChainEvm(parseInt(chain.chainId as string));

    }
  }



    // useEffect(() => {
    //   if (targetConnector.current === 'wagmi') {
    //     if (targetChainNamespace.current === ChainNamespace.evm) {
    //       setWallet(walletEVM);
    //     } else {
    //       setWallet(walletSOL)
    //     }
    //   }
    // }, [walletEVM, walletSOL]);

    useEffect(() => {
      // check current connector and chain form localstorage
      console.log('--- xxxxconnectorKey', connectorKey);

      if (!connectorKey) {
        return;
      }
      if (isManual.current) {
        return;
      }

      if (connectorKey === 'privy') {
        // todo need check chainNamespace in localstorage
        if (privyWalletEVM) {
          setWallet(privyWalletEVM);
          setConnectedChain(privyWalletEVM.chain)
        }
        if (privyWalletSOL) {
          // console.log('-- privy SOL wallet', privyWalletSOL);
          //   setWallet(privyWalletSOL);
          //   setConnectedChain(privyWalletSOL.chains[0])

        }
      }

    }, [connectorKey, privyWalletEVM, privyWalletSOL, wallet])


    return { connect, wallet, connectedChain, setChain, namespace };
  }
