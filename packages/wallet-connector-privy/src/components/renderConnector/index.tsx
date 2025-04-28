import React from "react";
import { WalletConnectType, WalletType } from "../../types";
import { cn } from "@orderly.network/ui";
import { useWalletConnectorPrivy } from "../../provider";
import { useWallet } from "../../hooks/useWallet";
import { ConnectProps } from "../../types";
import { PrivyConnectArea } from "./privyConnector";
import { EVMConnectArea } from "./wagmiConnector";
import { SOLConnectArea } from "./solanaConnector";
import { AbstractConnectArea } from "./abstractConnector";
export function RenderConnector() {
  const { connect } = useWallet();
  const { setOpenConnectDrawer, connectorWalletType, walletChainTypeConfig } =
    useWalletConnectorPrivy();

  const handleConnect = (params: ConnectProps) => {
    connect(params);
    if (params.walletType === WalletConnectType.PRIVY) {
      setOpenConnectDrawer(false);
    }
  };
  const renderPrivyConnectArea = () => {
    if (connectorWalletType.disablePrivy) {
      return null;
    }
    return (
      <PrivyConnectArea
        connect={(type) =>
          handleConnect({ walletType: WalletConnectType.PRIVY, extraType: type })
        }
      />
    );
  };
  const renderWagmiConnectArea = () => {
    if (connectorWalletType.disableWagmi) {
      return null;
    }
    if (!walletChainTypeConfig.hasEvm) {
      return null;
    }
    return (
      <EVMConnectArea
        connect={(connector) =>
          handleConnect({ walletType: WalletConnectType.EVM, connector: connector })
        }
      />
    );
  };
  const renderSolanaConnectArea = () => {
    if (connectorWalletType.disableSolana) {
      return null;
    }
    if (!walletChainTypeConfig.hasSol) {
      return null;
    }

    return (
      <SOLConnectArea
        connect={(walletAdapter) =>
          handleConnect({
            walletType: WalletConnectType.SOL,
            walletAdapter: walletAdapter,
          })
        }
      />
    );
  };
  const renderAbstractConnectArea = () => {
    if (connectorWalletType.disableAGW) {
      return null;
    }
    if (!walletChainTypeConfig.hasAbstract) {
      return null;
    }
    return (
      <AbstractConnectArea
        connect={() => handleConnect({ walletType: WalletConnectType.ABSTRACT })}
      />
    );
  };
  return (
    <div className={cn("oui-flex oui-flex-col oui-gap-4", "md:oui-gap-5")}>
      {renderPrivyConnectArea()}
      {renderWagmiConnectArea()}
      {renderSolanaConnectArea()}
      {renderAbstractConnectArea()}
    </div>
  );
 
}