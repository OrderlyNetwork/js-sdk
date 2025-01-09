import { useAccount, useConnect } from "wagmi";
import { useEffect, useMemo, useState } from "react";
import { ChainNamespace } from "@orderly.network/types";

export function useWagmiWallet() {
  const [wallet, setWallet] = useState<undefined | any>();
  const { connect, connectors } = useConnect();
  const { connector, isConnected, address, chainId } = useAccount();
  console.log("-- connectors --", connectors);
  const connectedChain = useMemo(() => {
    if (chainId) {
      return {
        id: chainId,
        namespace: ChainNamespace.evm,
      }

    }
    return null;

  }, [chainId])

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
      });
    });
  }, [connector, chainId, isConnected, address]);
  return { connectors, connect, wallet, connectedChain };
}
