import { useWalletConnector } from "./walletConnectProvider";

export const WalletButtonExample = () => {
  const wallet = useWalletConnector();
  return (
    <button
      onClick={() => {
        wallet.connect();
      }}
    >
      Wallet connect
    </button>
  );
};
