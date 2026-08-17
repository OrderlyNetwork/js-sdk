import { FC, lazy, ReactNode, Suspense } from "react";
import type { WalletMode } from "./walletMode";

const LegacyWalletConnector = lazy(() =>
  import("./walletConnector").then((module) => ({
    default: module.WalletConnector,
  })),
);

const PrivyWalletConnector = lazy(() =>
  import("./walletConnectorPrivy").then((module) => ({
    default: module.WalletConnectorPrivy,
  })),
);

type WalletConnectorProviderProps = {
  children: ReactNode;
  walletMode?: WalletMode;
  networkId?: string;
};

export const WalletConnectorProvider: FC<WalletConnectorProviderProps> = (
  props,
) => {
  const walletMode = props.walletMode ?? "wallet";

  return (
    <Suspense fallback={null}>
      {walletMode === "legacy" ? (
        <LegacyWalletConnector networkId={props.networkId}>
          {props.children}
        </LegacyWalletConnector>
      ) : (
        <PrivyWalletConnector
          enablePrivyLogin={walletMode === "privy"}
          networkId={props.networkId}
        >
          {props.children}
        </PrivyWalletConnector>
      )}
    </Suspense>
  );
};
