import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
} from "react";
import injectedModule from "@web3-onboard/injected-wallets";
import { init, useConnectWallet } from "@web3-onboard/react";

interface WalletConnectContextState {
  connect: () => Promise<any>;
}

const WalletConnectContext = createContext<WalletConnectContextState>(
  {} as WalletConnectContextState
);

const injected = injectedModule();
const apiKey = "1730eff0-9d50-4382-a3fe-89f0d34a2070";

// initialize Onboard
init({
  apiKey,
  wallets: [injected],
  chains: [
    {
      id: 42161,
      token: "ARB-ETH",
      label: "Arbitrum One",
      rpcUrl: "https://rpc.ankr.com/arbitrum",
    },
  ],
  theme: "dark",
});

export const WalletConnectProvider: FC<PropsWithChildren<{}>> = (props) => {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();

  useEffect(() => {
    // call account's setAdress method to update account status;
  }, [wallet]);

  return (
    <WalletConnectContext.Provider value={{ connect }}>
      {props.children}
    </WalletConnectContext.Provider>
  );
};

export const useWalletConnector = () => {
  return useContext(WalletConnectContext);
};
