import { registerSimpleDialog, registerSimpleSheet } from "@orderly.network/ui";

import { useWalletConnectorBuilder } from "./useWalletConnectorBuilder";
import { WalletConnectContent } from "./walletConnectorContent";

export const WalletConnectorModalId = "walletConnector" as const;
export const WalletConnectorSheetId = "walletConnectorSheet" as const;

export const WalletConnectorWidget = (props: any) => {
  const state = useWalletConnectorBuilder();
  return <WalletConnectContent {...state} {...props} />;
};

registerSimpleDialog(WalletConnectorModalId, WalletConnectorWidget, {
  size: "sm",
  title: "Connect wallet",
});

registerSimpleSheet(WalletConnectorSheetId, WalletConnectorWidget, {
  title: "Connect wallet",
});
