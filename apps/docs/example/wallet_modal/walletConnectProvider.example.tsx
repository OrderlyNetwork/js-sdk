import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
} from "react";

import {
  createWeb3Modal,
  defaultConfig,
  useWeb3Modal,
} from "@web3modal/ethers5/react";

import { useAccount } from "@orderly.network/hooks";

interface WalletConnectContextState {
  connect: () => Promise<any>;
}

const WalletConnectContext = createContext<WalletConnectContextState>(
  {} as WalletConnectContextState
);

// 1. Get projectId
const projectId = "YOUR_PROJECT_ID";

// 2. Set chains
const mainnet = {
  chainId: 42161,
  name: "Arbitrum One",
  currency: "ARB-ETH",
  explorerUrl: "https://etherscan.io",
  rpcUrl: "https://rpc.ankr.com/arbitrum",
};

// 3. Create modal
const metadata = {
  name: "My Website",
  description: "My Website description",
  url: "https://mywebsite.com",
  icons: ["https://avatars.mywebsite.com/"],
};

createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [mainnet],
  projectId,
});

export const WalletConnectProvider: FC<PropsWithChildren<{}>> = (props) => {
  const { account } = useAccount();

  const { open } = useWeb3Modal();

  useEffect(() => {
    // call account's setAdress method to update account status;
  }, []);

  return (
    <WalletConnectContext.Provider value={{ connect: open }}>
      {props.children}
    </WalletConnectContext.Provider>
  );
};

export const useWalletConnector = () => {
  return useContext(WalletConnectContext);
};
