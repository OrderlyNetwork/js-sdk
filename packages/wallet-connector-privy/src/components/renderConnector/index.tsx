import React from "react";
import { useStorageChain } from "@orderly.network/hooks";
import { cn, Flex, ScrollArea } from "@orderly.network/ui";
import { useWallet } from "../../hooks/useWallet";
import { useWalletConnectorPrivy } from "../../provider";
import { WalletConnectType, WalletType } from "../../types";
import { ConnectProps } from "../../types";
import { getChainType } from "../../util";
import { AbstractConnectArea } from "./abstractConnector";
import { PrivyConnectArea } from "./privyConnector";
import { SOLConnectArea } from "./solanaConnector";
import { SUIConnectArea } from "./suiConnector";
import { EVMConnectArea } from "./wagmiConnector";

export function RenderConnector() {
  const { connect } = useWallet();
  const {
    setOpenConnectDrawer,
    connectorWalletType,
    walletChainTypeConfig,
    targetWalletType,
    suiInfo,
    suiChainIds,
  } = useWalletConnectorPrivy();
  const { storageChain } = useStorageChain();

  const selectedWalletType: WalletType | undefined = (() => {
    if (targetWalletType) return targetWalletType;
    if (!storageChain?.chainId) return undefined;
    try {
      const chainId = parseInt(storageChain.chainId as string);
      if (suiInfo?.chainId === chainId || suiChainIds.has(chainId)) {
        return WalletType.SUI;
      }
      return getChainType(chainId);
    } catch {
      return undefined;
    }
  })();

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
          handleConnect({
            walletType: WalletConnectType.PRIVY,
            extraType: type,
          })
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
          handleConnect({
            walletType: WalletConnectType.EVM,
            connector: connector,
          })
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
  const renderSuiConnectArea = () => {
    if (connectorWalletType.disableSui) {
      return null;
    }
    if (!walletChainTypeConfig.hasSui) {
      return null;
    }

    return (
      <SUIConnectArea
        connect={(suiWallet) =>
          handleConnect({
            walletType: WalletConnectType.SUI,
            suiWallet,
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
        connect={() =>
          handleConnect({ walletType: WalletConnectType.ABSTRACT })
        }
      />
    );
  };

  const walletOrder = ["evm", "sol", "sui", "abstract"] as const;

  const typeToKey: Record<WalletType, (typeof walletOrder)[number]> = {
    [WalletType.EVM]: "evm",
    [WalletType.SOL]: "sol",
    [WalletType.SUI]: "sui",
    [WalletType.ABSTRACT]: "abstract",
  };

  const prioritizedKey = selectedWalletType
    ? typeToKey[selectedWalletType]
    : undefined;

  const orderedWalletKeys =
    prioritizedKey && prioritizedKey !== "sui"
      ? ([
          prioritizedKey,
          ...walletOrder.filter((k) => k !== prioritizedKey),
        ] as const)
      : walletOrder;

  const renderByKey = (key: (typeof walletOrder)[number]) => {
    switch (key) {
      case "evm":
        return renderWagmiConnectArea();
      case "sol":
        return renderSolanaConnectArea();
      case "sui":
        return renderSuiConnectArea();
      case "abstract":
        return renderAbstractConnectArea();
      default:
        return null;
    }
  };
  return (
    <ScrollArea className="oui-flex oui-grow oui-shrik oui-basis-auto oui-custom-scrollbar">
      <div className={cn("oui-flex oui-flex-col oui-gap-4", "md:oui-gap-5")}>
        {renderPrivyConnectArea()}
        {orderedWalletKeys.map((key) => (
          <React.Fragment key={key}>{renderByKey(key)}</React.Fragment>
        ))}
      </div>
    </ScrollArea>
  );
}
