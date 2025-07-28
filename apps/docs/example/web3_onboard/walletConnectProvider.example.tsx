import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
} from "react";
import injectedModule from "@web3-onboard/injected-wallets";
import { init, useConnectWallet } from "@web3-onboard/react";
import { useAccount } from "@orderly.network/hooks";

interface WalletConnectContextState {
  connect: () => Promise<any>;
}

const WalletConnectContext = createContext<WalletConnectContextState>(
  {} as WalletConnectContextState,
);

const injected = injectedModule();
const apiKey = "1730eff0-9d50-4382-a3fe-89f0d34a2070";

// initialize Onboard
init({
  apiKey,
  wallets: [injected],
  chains: [
    {
      id: 421613,
      token: "AGOR",
      label: "Arbitrum Goerli",
      rpcUrl: "https://endpoints.omniatech.io/v1/arbitrum/goerli/public",
    },
  ],
  theme: "dark",
});

export const WalletConnectProvider: FC<PropsWithChildren<{}>> = (props) => {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const { account } = useAccount();

  useEffect(() => {
    // call account's setAdress method to update account status;
    if (Array.isArray(wallet?.accounts) && wallet?.accounts.length) {
      const item = wallet.accounts[0];
      const chain = wallet.chains[0];
      account.setAddress(item.address, {
        provider: wallet.provider,
        chain: {
          id: chain.id,
        },
        wallet: {
          name: wallet.label,
        },
      });
    }
  }, [wallet]);

  const memoizedValue = useMemo<WalletConnectContextState>(() => {
    return { connect };
  }, [connect]);

  return (
    <WalletConnectContext.Provider value={memoizedValue}>
      {props.children}
    </WalletConnectContext.Provider>
  );
};

export const useWalletConnector = () => {
  return useContext(WalletConnectContext);
};
