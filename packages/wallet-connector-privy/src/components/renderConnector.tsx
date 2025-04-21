import React from "react";
import { WalletAdapter } from "@solana/wallet-adapter-base";
import { ConnectProps } from "../types";
import { useWallet } from "../hooks/useWallet";
import { useWalletConnectorPrivy } from "../provider";
import { useTranslation } from "@orderly.network/i18n";
import { useScreen } from "@orderly.network/ui";
import { WalletType } from "../types";
import { cn } from "@orderly.network/ui";
import { useWagmiWallet } from "../providers/wagmi/wagmiWalletProvider";
import { useSolanaWallet } from "../providers/solana/solanaWalletProvider";
import { RenderWalletIcon } from "./common";

export function RenderConnector() {
  const { connect } = useWallet();
  const { setOpenConnectDrawer, connectorWalletType, walletChainTypeConfig } =
    useWalletConnectorPrivy();

  const handleConnect = (params: ConnectProps) => {
    connect(params);
    if (params.walletType === WalletType.PRIVY) {
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
          handleConnect({ walletType: WalletType.PRIVY, extraType: type })
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
          handleConnect({ walletType: WalletType.EVM, connector: connector })
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
            walletType: WalletType.SOL,
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
        connect={() => handleConnect({ walletType: WalletType.ABS })}
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


function PrivyConnectArea({ connect }: { connect: (type: any) => void }) {
  const { t } = useTranslation();
  const { isMobile, isDesktop } = useScreen();
  const { connectorWalletType } = useWalletConnectorPrivy();
  return (
    <div className="">
      <div
        className={cn(
          "oui-flex oui-items-center oui-justify-between",
          "oui-text-base-contrast-80 oui-text-sm oui-font-semibold oui-mb-3",
          "md:oui-mb-2"
        )}
      >
        {t("connector.privy.loginIn")}
        {isMobile && (
          <div className="oui-h-3 oui-flex oui-justify-center">
            <img
              src="https://oss.orderly.network/static/sdk/privy/privy-logo.png"
              className=" oui-h-[10px]"
            />
          </div>
        )}
      </div>
      <div
        className={cn(
          "oui-grid oui-grid-cols-2 oui-gap-2",
          "md:oui-flex md:oui-flex-col md:oui-gap-2"
        )}
      >
        <div
          className="oui-cursor-pointer oui-rounded-[6px] oui-bg-[#333948] oui-px-2 oui-py-[11px] oui-flex oui-justify-center oui-items-center oui-gap-1"
          onClick={() => connect({ walletType: "privy", extraType: "email" })}
        >
          <img
            src="https://oss.orderly.network/static/sdk/privy/email.svg"
            className="oui-w-[18px] oui-h-[18px]"
          />
          <div className="oui-text-base-contrast oui-text-2xs">
            {t("connector.privy.email")}
          </div>
        </div>

        <div
          className="oui-rounded-[6px] oui-bg-[#335FFC] oui-px-2 oui-py-[11px] oui-flex oui-justify-center oui-items-center oui-gap-1 oui-cursor-pointer"
          onClick={() => connect({ walletType: "privy", extraType: "google" })}
        >
          <img
            src="https://oss.orderly.network/static/sdk/privy/google.svg"
            className="oui-w-[18px] oui-h-[18px]"
          />
          <div className="oui-text-base-contrast oui-text-2xs">
            {t("connector.privy.google")}
          </div>
        </div>

        <div
          className="oui-rounded-[6px] oui-bg-[#07080A] oui-px-2 oui-py-[11px] oui-flex oui-justify-center oui-items-center oui-gap-1 oui-cursor-pointer"
          onClick={() => connect({ walletType: "privy", extraType: "twitter" })}
        >
          <img
            src="https://oss.orderly.network/static/sdk/privy/twitter.svg"
            className="oui-w-[18px] oui-h-[18px]"
          />
          <div className="oui-text-base-contrast oui-text-2xs">
            {t("connector.privy.twitter")}
          </div>
        </div>
      </div>
      {isDesktop && (
        <div className="oui-h-3 oui-flex oui-justify-center oui-mt-4">
          <img
            src="https://oss.orderly.network/static/sdk/privy/privy-logo.png"
            className=" oui-h-[10px]"
          />
        </div>
      )}
      {(!connectorWalletType.disableWagmi ||
        !connectorWalletType.disableSolana) && (
        <div className="oui-h-[1px] oui-bg-line oui-w-full oui-mt-4 md:oui-mt-5"></div>
      )}
    </div>
  );
}

function EVMConnectArea({ connect }: { connect: (type: any) => void }) {
  const { connectors } = useWagmiWallet();

  return (
    <div className="">
      <div className="oui-text-base-contrast-80 oui-text-sm oui-font-semibold oui-mb-2">
        EVM
      </div>
      <div className="oui-grid oui-grid-cols-2 oui-gap-2">
        {connectors.map((item, key) => (
          <div
            key={key}
            className=" oui-flex oui-items-center oui-justify-start oui-gap-1 oui-rounded-[6px] oui-px-2 oui-bg-[#07080A] oui-py-[11px] oui-flex-1 oui-cursor-pointer"
            onClick={() => connect(item)}
          >
            <RenderWalletIcon connector={item} />
            <div className="oui-text-base-contrast oui-text-2xs">
              {item.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SOLConnectArea({
  connect,
}: {
  connect: (walletAdapter: WalletAdapter) => void;
}) {
  const { wallets } = useSolanaWallet();

  return (
    <div>
      <div className="oui-text-base-contrast-80 oui-text-sm oui-font-semibold oui-mb-2">
        Solana
      </div>
      <div className="oui-grid oui-grid-cols-2 oui-gap-2">
        {wallets.map((item, key) => (
          <div
            key={key}
            className=" oui-flex oui-items-center oui-justify-start oui-gap-1 oui-rounded-[6px] oui-px-2 oui-bg-[#07080A] oui-py-[11px] oui-flex-1 oui-cursor-pointer"
            onClick={() => connect(item.adapter)}
          >
            <RenderWalletIcon connector={item.adapter} />
            <div className="oui-text-base-contrast oui-text-2xs">
              {item.adapter.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AbstractConnectArea({ connect }: { connect: () => void }) {
  return (
    <div>
      <div className="oui-text-base-contrast-80 oui-text-sm oui-font-semibold oui-mb-2">
        Abstract
      </div>
      <div className="oui-grid oui-grid-cols-2 oui-gap-2">
        <div
          className=" oui-flex oui-items-center oui-justify-start oui-gap-1 oui-rounded-[6px] oui-px-2 oui-bg-[#07080A] oui-py-[11px] oui-flex-1 oui-cursor-pointer"
          onClick={() => connect()}
        >
          <div className="oui-w-[18px] oui-h-[18px] oui-flex oui-items-center oui-justify-center">
            <img
              className={cn("oui-w-[18px] oui-h-[18px]")}
              src={""}
              alt="abstract wallet"
            />
          </div>
          <div className="oui-text-base-contrast oui-text-2xs">Abstract</div>
        </div>
      </div>
    </div>
  );
}
