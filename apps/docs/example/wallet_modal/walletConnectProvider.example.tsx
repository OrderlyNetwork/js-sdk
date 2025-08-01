import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
} from "react";
import {
  createWeb3Modal,
  defaultWagmiConfig,
  useWeb3Modal,
} from "@web3modal/wagmi/react";
import { arbitrum, mainnet } from "viem/chains";
import { WagmiConfig } from "wagmi";
import { useAccount } from "@orderly.network/hooks";

interface WalletConnectContextState {
  connect: () => Promise<any>;
}

const WalletConnectContext = createContext<WalletConnectContextState>(
  {} as WalletConnectContextState,
);
// 1. Get projectId at https://cloud.walletconnect.com
const projectId = "YOUR_PROJECT_ID";

// 2. Create wagmiConfig
const metadata = {
  name: "Web3Modal",
  description: "Web3Modal Example",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const chains = [mainnet, arbitrum];
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

// 3. Create modal
createWeb3Modal({ wagmiConfig, projectId, chains });

export const WalletConnectProvider: FC<PropsWithChildren<{}>> = (props) => {
  const { account } = useAccount();

  const { open } = useWeb3Modal();

  useEffect(() => {
    // call account's setAdress method to update account status;
  }, []);

  const memoizedValue = useMemo<WalletConnectContextState>(() => {
    return { connect: open };
  }, [open]);

  return (
    <WalletConnectContext.Provider value={memoizedValue}>
      {props.children}
    </WalletConnectContext.Provider>
  );
};

export const useWalletConnector = () => {
  return useContext(WalletConnectContext);
};
