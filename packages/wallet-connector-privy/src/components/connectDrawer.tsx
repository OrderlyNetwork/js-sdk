import {
  useScreen,
  cn,
  CloseIcon,
} from "@orderly.network/ui";
import React, { useMemo } from "react";
import { usePrivyWallet } from "../providers/privy/privyWalletProvider";
import {  WalletType } from "../types";
import { useWalletConnectorPrivy } from "../provider";
import { useWagmiWallet } from "../providers/wagmi/wagmiWalletProvider";
import { useSolanaWallet } from "../providers/solana/solanaWalletProvider";
import { useLocalStorage } from "@orderly.network/hooks";
import { useTranslation, Trans } from "@orderly.network/i18n";
import { Drawer } from "./drawer";
import { RenderPrivyWallet } from "./renderPrivyWallet";
import { ConnectorKey } from "@orderly.network/types";
import { useAbstractWallet } from "../providers/abstractWallet/abstractWalletProvider";
import { RenderNonPrivyWallet } from "./renderNonPrivyWallet";
import { RenderConnector } from "./renderConnector";



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
}) {
  const { t } = useTranslation();
  const { isConnected: isConnectedPrivy } = usePrivyWallet();
  const { isConnected: isConnectedEvm } = useWagmiWallet();
  const { isConnected: isConnectedSolana } = useSolanaWallet();
  const { isConnected: isConnectedAbstract } = useAbstractWallet();
  const { termsOfUse} = useWalletConnectorPrivy();
  const [connectorKey] = useLocalStorage(ConnectorKey, "");

  const isConnected = useMemo(() => {
    if (connectorKey === WalletType.PRIVY && isConnectedPrivy) {
      return true;
    }
    if (connectorKey !== WalletType.PRIVY) {
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
  }, [isConnectedPrivy, isConnectedEvm, isConnectedSolana, isConnectedAbstract, connectorKey]);

  const { isMobile } = useScreen();

  return (
    <Drawer isOpen={props.open} onClose={() => props.onChangeOpen(false)}>
      {!isMobile && (
        <div
          className="oui-z-0 oui-absolute -oui-top-[calc(100vh/2)] oui-h-[100vh] oui-left-[50px] oui-right-[50px]"
          style={{
            background:
              "conic-gradient(from -41deg at 40.63% 50.41%, rgba(242, 98, 181, 0.00) 125.17920970916748deg, rgba(95, 197, 255, 0.20) 193.4119462966919deg, rgba(255, 172, 137, 0.20) 216.0206937789917deg, rgba(129, 85, 255, 0.20) 236.0708713531494deg, rgba(120, 157, 255, 0.20) 259.95326042175293deg, rgba(159, 115, 241, 0.00) 311.0780096054077deg)",
            filter: "blur(50px)",
          }}
        />
      )}
      <div className="oui-z-10 oui-relative">
        <div className="oui-flex oui-justify-between oui-items-center oui-mb-4 md:oui-mb-5">
          <div
            className={cn(
              "oui-font-semibold oui-text-base-contrast-80 ",
              "oui-text-[20px] oui-py-2",
              "md:oui-text-base md:oui-py-0"
            )}
          >
            {isConnected
              ? t("connector.privy.myWallet")
              : t("connector.connectWallet")}
          </div>
          <CloseIcon
            className="oui-cursor-pointer oui-text-base-contrast-20 oui-w-5 oui-h-5 hover:oui-text-base-contrast-80"
            onClick={() => props.onChangeOpen(false)}
          />
        </div>
        {isConnected ? <MyWallet /> : <RenderConnector />}
      </div>

      {!isConnected && (
        <div className="oui-z-10 oui-text-base-contrast-80 oui-text-center oui-text-2xs oui-relative  oui-font-semibold">
          {/* @ts-ignore */}
          <Trans
            i18nKey="connector.privy.termsOfUse"
            components={[
              <a
                href={termsOfUse}
                className="oui-cursor-pointer oui-underline oui-text-primary"
                target="_blank"
              />,
            ]}
          />
        </div>
      )}
    </Drawer>
  );
}
