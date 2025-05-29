import React, { useCallback, useMemo } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import { useTranslation, Trans } from "@orderly.network/i18n";
import { ConnectorKey } from "@orderly.network/types";
import { useScreen, cn, CloseIcon } from "@orderly.network/ui";
import { useWalletConnectorPrivy } from "../provider";
import { useAbstractWallet } from "../providers/abstractWallet/abstractWalletProvider";
import { usePrivyWallet } from "../providers/privy/privyWalletProvider";
import { useSolanaWallet } from "../providers/solana/solanaWalletProvider";
import { useWagmiWallet } from "../providers/wagmi/wagmiWalletProvider";
import { WalletConnectType, WalletType } from "../types";
import { Drawer } from "./drawer";
import { RenderConnector } from "./renderConnector";
import { RenderNonPrivyWallet } from "./renderNonPrivyWallet";
import { RenderPrivyWallet } from "./renderPrivyWallet";

function MyWallet() {
  const [connectorKey, setConnectorKey] = useLocalStorage(ConnectorKey, "");

  return (
    <div>
      {connectorKey === "privy" && <RenderPrivyWallet />}

      {connectorKey !== "privy" && <RenderNonPrivyWallet />}
    </div>
  );
}

export function ConnectDrawer(props: {
  open: boolean;
  onChangeOpen: (open: boolean) => void;
  headerProps?: {
    mobile: React.ReactNode;
  };
}) {
  const { t } = useTranslation();
  const { isConnected: isConnectedPrivy } = usePrivyWallet();
  const { isConnected: isConnectedEvm } = useWagmiWallet();
  const { isConnected: isConnectedSolana } = useSolanaWallet();
  const { isConnected: isConnectedAbstract } = useAbstractWallet();
  const { termsOfUse } = useWalletConnectorPrivy();
  const [connectorKey] = useLocalStorage(ConnectorKey, "");

  const isConnected = useMemo(() => {
    if (connectorKey === WalletConnectType.PRIVY && isConnectedPrivy) {
      return true;
    }
    if (connectorKey !== WalletConnectType.PRIVY) {
      if (isConnectedEvm) {
        return true;
      }
      if (isConnectedSolana) {
        return true;
      }
      if (isConnectedAbstract) {
        return true;
      }
    }
    return false;
  }, [
    isConnectedPrivy,
    isConnectedEvm,
    isConnectedSolana,
    isConnectedAbstract,
    connectorKey,
  ]);

  const { isMobile } = useScreen();

  const renderHeader = useCallback(() => {
    if (isMobile && props.headerProps?.mobile) {
      return props.headerProps?.mobile;
    }
    return (
      <div
        className={cn(
          "oui-font-semibold oui-text-base-contrast-80 ",
          "oui-py-2 oui-text-[20px]",
          "md:oui-py-0 md:oui-text-base",
        )}
      >
        {isConnected
          ? t("connector.privy.myWallet")
          : t("connector.connectWallet")}
      </div>
    );
  }, [isMobile, props.headerProps?.mobile, isConnected]);
  return (
    <Drawer isOpen={props.open} onClose={() => props.onChangeOpen(false)}>
      {!isMobile && (
        <div
          className="oui-absolute oui-inset-x-[50px] -oui-top-[calc(100vh/2)] oui-z-0 oui-h-screen"
          style={{
            background:
              "conic-gradient(from -41deg at 40.63% 50.41%, rgba(242, 98, 181, 0.00) 125.17920970916748deg, rgba(95, 197, 255, 0.20) 193.4119462966919deg, rgba(255, 172, 137, 0.20) 216.0206937789917deg, rgba(129, 85, 255, 0.20) 236.0708713531494deg, rgba(120, 157, 255, 0.20) 259.95326042175293deg, rgba(159, 115, 241, 0.00) 311.0780096054077deg)",
            filter: "blur(50px)",
          }}
        />
      )}
      <div className="oui-relative oui-z-10">
        <div className="oui-mb-4 oui-flex oui-items-center oui-justify-between md:oui-mb-5">
          {renderHeader()}
          <CloseIcon
            className="oui-size-5 oui-cursor-pointer oui-text-base-contrast-20 hover:oui-text-base-contrast-80"
            onClick={() => props.onChangeOpen(false)}
          />
        </div>
        {isConnected ? <MyWallet /> : <RenderConnector />}
      </div>

      {!isConnected && (
        <div className="oui-relative oui-z-10 oui-text-center oui-text-2xs oui-font-semibold  oui-text-base-contrast-80">
          {/* @ts-ignore */}
          <Trans
            i18nKey="connector.privy.termsOfUse"
            components={[
              <a
                key="termsOfUse"
                href={termsOfUse}
                className="oui-cursor-pointer oui-text-primary oui-underline"
                target="_blank"
                rel="noreferrer"
              />,
            ]}
          />
        </div>
      )}
    </Drawer>
  );
}
