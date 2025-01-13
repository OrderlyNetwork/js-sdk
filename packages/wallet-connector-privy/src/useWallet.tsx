import { useWagmiWallet } from "./useWagmiWallet";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSoalanWallet } from "./useSoalanWallet";
import { usePrivyWallet } from "./usePrivyWallet";

export function useWallet() {
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
    wallet: walletPrivy,
  } = usePrivyWallet();
  const [wallet, setWallet] = useState<any>();
  const isPrivy = useRef(false);
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
        connectPrivy();

      }
    } catch (e) {
      console.log("-- e", e);
    }
  };

  const connectedChain = useMemo(() => {
    return connectedChainEvm;
  }, [connectedChainEvm]);

  const setChain = (chain:{chainId: number | string}) => {
    return setChainEvm(parseInt(chain.chainId as string));

  }

  useEffect(() => {
    setWallet(walletEVM);
  }, [walletEVM]);
  return { connect, wallet, connectedChain, setChain };
}
