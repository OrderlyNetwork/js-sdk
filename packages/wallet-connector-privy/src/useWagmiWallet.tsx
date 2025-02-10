import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChainNamespace } from "@orderly.network/types";

export function useWagmiWallet() {
  const [wallet, setWallet] = useState<undefined | any>();
  const { connect, connectors } = useConnect();
  const {disconnect} = useDisconnect();
  const { connector, isConnected, address, chainId, } = useAccount();
  const {chains, error: switchNetworkError, switchChain} = useSwitchChain();
  const connectedChain = useMemo(() => {
    if (chainId) {
      return {
        id: chainId,
        namespace: ChainNamespace.evm,
      }

    }
    return null;

  }, [chainId])

  const setChain = async (chainId: number) => {
    return new Promise((resolve, reject) => {
       switchChain({chainId}, {
        onSuccess: () => {
          return resolve(true);

        }, onError: (e) => {
          console.log('-- switch chain error', e);

          return reject(e);
        }})
    })
  }

  useEffect(() => {
    if (!connector || !isConnected) {
      setWallet(undefined)
      return;
    }
    connector.getProvider().then((provider) => {
      console.log('-- connector provider ',{
        provider,
        connector,
      });
      setWallet({
        label: connector.name ,
        icon: "",
        provider: provider,
        accounts: [
          {
            address: address,
          },
        ],
        chains:[ {
          id: chainId,
          namespace: ChainNamespace.evm,
        }],
        chain: connectedChain
      });
    });
  }, [connector, chainId, isConnected, address, connectedChain]);
  return { connectors, connect, wallet, connectedChain, setChain, disconnect };
}
