import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChainNamespace } from "@orderly.network/types";

export function useWagmiWallet() {
  const [wallet, setWallet] = useState<undefined | any>(undefined);
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

  const setChain = useCallback((chainId: number) => {
      return new Promise((resolve, reject) => {
         switchChain({chainId}, {
          onSuccess: () => {
          return resolve(true);

        }, onError: (e) => {
          console.log('-- switch chain error', e);

          return reject(e);
        }})
    })
  }, [switchChain])

  useEffect(() => {
    if (!connector || !isConnected) {
      console.log('-- xxx wagmi wallet setundefine', isConnected);
      
      setWallet(undefined)
      return;
    }
    connector.getProvider().then((provider) => {
      // console.log('-- connector provider ',{
      //   provider,
      //   connector,
      //   address,
      //   chainId,
      // });
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
  return { connectors, connect, wallet, connectedChain, setChain, disconnect, isConnected };
}
