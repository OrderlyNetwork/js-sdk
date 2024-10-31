import React, {
  type PropsWithChildren,
  useEffect,
  useMemo, useRef,
  useState
} from "react";
import { WalletConnectorContext } from "@orderly.network/hooks";
import { ChainNamespace } from "@orderly.network/types";
import { useSOL } from "./useSOL";
import { useEvm } from "./useEvm";

const SOL_CHAIN_IDS = [901901901];

export function Main(props: PropsWithChildren) {
  const sol = useSOL();
  const evm = useEvm();

  const [namespace, setNamespace] = useState<ChainNamespace | null>(null);

  const newNamespace = useRef<ChainNamespace | null>();

  const connect = async (options: any) => {
    if ([901901901].includes(options.chainId)) {
      newNamespace.current = ChainNamespace.solana;
      // connect solana
      return sol.connect().then((res) => {
        console.log("-- connect sol", res);
        if (res) {
          return res;
        }
      });
    }
    newNamespace.current = ChainNamespace.evm;
    return evm.connect().then((res) => {
      if (res) {
        return res;
      }
    });
  };

  const disconnect = async () => {
    if (namespace === ChainNamespace.evm) {
      return evm.disconnect();
    }
    if (namespace === ChainNamespace.solana) {
      return sol.disconnect();
    }
  };

  const connecting =
    newNamespace.current == ChainNamespace.solana ? sol.connecting : evm.connecting;

  const wallet = useMemo(() => {
    if (namespace === ChainNamespace.solana && sol.connected) {
      return sol.wallet;
    }
    if (namespace === ChainNamespace.evm && evm.connected) {
      return evm.wallet;
    }
    return null;
  }, [namespace, sol.connected, evm.connected]);

  // const wallet = (namespace === ChainNamespace.solana && sol.connected) ? sol.wallet : (namespace === ChainNamespace.evm && evm.connected ? evm.wallet : null);

  const connectedChain =
    namespace === ChainNamespace.solana
      ? sol.connectedChain
      : evm.connectedChain;

  const setChain = (chain: any) => {
    // solana connect
    let tempNamespace: ChainNamespace = ChainNamespace.evm;
    if (SOL_CHAIN_IDS.includes(chain.chainId)) {
      tempNamespace = ChainNamespace.solana;
    }
    if (namespace === tempNamespace && namespace === ChainNamespace.evm) {
      // todo switch chan on block native

      return evm.changeChain(chain);
    }
    if (namespace !== tempNamespace) {
      return connect({ chainId: chain.chainId }).then();
    }
    console.log("-- set chain", chain);
  };

  useEffect(() => {
    // console.log("-- connect", {
    //   sol: sol.connected,
    //   evm: evm.connected,
    // });
    if (sol.connected && evm.connected) {
      if (newNamespace.current === ChainNamespace.solana) {
        evm.disconnect().then();
        setNamespace(ChainNamespace.solana);
        return;
      } else {
        setNamespace(ChainNamespace.evm);
        sol.disconnect().then();
        return;
      }
    }

    if (sol.connected) {
      setNamespace(ChainNamespace.solana);
      return;
    }
    if (evm.connected) {
      setNamespace(ChainNamespace.evm);
      return;
    }
  }, [newNamespace.current, sol.connected, evm.connected]);

  return (
    <WalletConnectorContext.Provider
      value={{
        connect,
        disconnect,
        connecting,
        wallet,
        setChain,
        connectedChain,
        namespace,
      }}
    >
      {props.children}
    </WalletConnectorContext.Provider>
  );
}
