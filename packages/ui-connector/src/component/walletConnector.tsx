import { registerSimpleDialog } from "@orderly.network/ui";

import { useWalletConnectorBuilder } from "./useWalletConnectorBuilder";
import { WalletConnectContent } from "./walletConnectorContent";

export const WalletConnectorModalId = "walletConnector" as const;

export const WalletConnectorWidget = (props: any) => {
  const state = useWalletConnectorBuilder();
  return <WalletConnectContent {...state} {...props} />;
};

registerSimpleDialog(WalletConnectorModalId, WalletConnectorWidget, {
  size: "md",
  title: "Connect wallet",
});
