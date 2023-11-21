import { useWalletConnector } from "./walletConnectProvider";

export const WalletButton = () => {
  const { connect } = useWalletConnector();
  return (
    <button
      onClick={() => {
        connect();
      }}
    >
      Wallet connect
    </button>
  );
};
