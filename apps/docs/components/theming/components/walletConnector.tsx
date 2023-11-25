import { useAccount } from "@orderly.network/hooks";
import { WalletConnect } from "@orderly.network/react";
import { AccountStatusEnum } from "@orderly.network/types";

export const WalletConnector = () => {
  const { state } = useAccount();
  return <WalletConnect status={state.status} />;
};
