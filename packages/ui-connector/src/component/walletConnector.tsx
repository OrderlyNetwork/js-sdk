import {  registerSimpleDialog } from "@orderly.network/ui";

import { useWalletConnectorBuilder } from "./useWalletConnectorBuilder";
import {WalletConnectContent} from './walletConnectorContent'

export const WalletConnectorModalId = "walletConnector" as const;

export const WalletConnectorWidget = () => {
  const state = useWalletConnectorBuilder();
  return <WalletConnectContent {...state} />;
};

registerSimpleDialog(WalletConnectorModalId, WalletConnectorWidget, {
  size: "md",
  title: "Connect wallet",
});
