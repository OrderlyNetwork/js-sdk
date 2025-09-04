import React from "react";
import { i18n } from "@orderly.network/i18n";
import { registerSimpleDialog, registerSimpleSheet } from "@orderly.network/ui";
import { useWalletConnectorBuilder } from "./useWalletConnectorBuilder";
import { WalletConnectContent } from "./walletConnectorContent";

export const WalletConnectorModalId = "walletConnector" as const;
export const WalletConnectorSheetId = "walletConnectorSheet" as const;

export const WalletConnectorWidget: React.FC<any> = (props) => {
  const state = useWalletConnectorBuilder();
  return <WalletConnectContent {...state} {...props} />;
};

registerSimpleDialog(WalletConnectorModalId, WalletConnectorWidget, {
  size: "sm",
  title: () => i18n.t("connector.connectWallet"),
});

registerSimpleSheet(WalletConnectorSheetId, WalletConnectorWidget, {
  title: () => i18n.t("connector.connectWallet"),
});
