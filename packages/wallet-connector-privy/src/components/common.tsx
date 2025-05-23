import React, { useState } from "react";
import { WalletAdapter } from "@solana/wallet-adapter-base";
import { Connector } from "wagmi";
import { useTranslation } from "@orderly.network/i18n";
import {
  ChainIcon,
  cn,
  Popover,
  SimpleDialog,
  useScreen,
} from "@orderly.network/ui";
import { useWalletConnectorPrivy } from "../provider";
import { getWalletIcon } from "../util";

export function RenderPrivyTypeIcon({
  type,
  size,
  black,
}: {
  type: string;
  size: number;
  black?: boolean;
}) {
  if (type === "email") {
    return (
      <img
        src={`https://oss.orderly.network/static/sdk/privy/email${
          black ? "-black" : ""
        }.svg`}
        width={size}
      />
    );
  }
  if (type === "google_oauth") {
    return (
      <img
        src="https://oss.orderly.network/static/sdk/privy/google.svg"
        width={size}
      />
    );
  }
  if (type === "twitter_oauth") {
    return (
      <img
        src={`https://oss.orderly.network/static/sdk/privy/twitter${
          black ? "-black" : ""
        }.svg`}
        width={size}
      />
    );
  }
  return (
    <img
      src={`https://oss.orderly.network/static/sdk/privy/email${
        black ? "-black" : ""
      }.svg`}
      width={size}
    />
  );
}
export function RenderWalletIcon({
  connector,
}: {
  connector: Connector | WalletAdapter;
}) {
  const icon = connector.icon
    ? connector.icon
    : getWalletIcon((connector as Connector).type);
  return (
    <div className="oui-w-[18px] oui-h-[18px] oui-flex oui-items-center oui-justify-center">
      <img
        className={cn(
          connector.icon
            ? "oui-w-[12px] oui-h-[12px]"
            : "oui-w-[18px] oui-h-[18px]",
        )}
        src={icon}
        alt={connector.name}
      />
    </div>
  );
}

export function EVMChainPopover({ children }: { children: React.ReactNode }) {
  const { getChainsByNetwork } = useWalletConnectorPrivy();
  const [chains] = useState(getChainsByNetwork("mainnet"));
  const { t } = useTranslation();
  const { isMobile } = useScreen();
  const [open, setOpen] = useState(false);

  if (isMobile) {
    return (
      <>
        <SimpleDialog
          open={open}
          size="xs"
          onOpenChange={setOpen}
          classNames={{
            content: "oui-p-4 oui-z-[99]",
            overlay: "oui-z-[99]",
          }}
          title={t("connector.privy.supportedEvmChain")}
        >
          <div className="oui-p-1 oui-grid oui-grid-cols-2 oui-gap-x-2 oui-gap-y-3 oui-text-2xs oui-text-base-contrast-54">
            {chains.map((item, key) => (
              <div
                key={key}
                className="oui-flex oui-items-center oui-justify-start oui-gap-1"
              >
                <ChainIcon chainId={item.id} size="2xs" />
                <div>{item.name}</div>
              </div>
            ))}
          </div>
        </SimpleDialog>
        <button onClick={() => setOpen(true)}>{children}</button>
      </>
    );
  }

  return (
    <Popover
      content={
        <div>
          <div className="oui-text-2xs oui-font-semibold oui-text-base-contrast">
            {t("connector.privy.supportedEvmChain")}
          </div>
          <div className="oui-mt-3 oui-grid oui-grid-cols-3 oui-gap-x-2 oui-gap-y-3 oui-text-2xs oui-text-base-contrast-54">
            {chains.map((item, key) => (
              <div
                key={key}
                className="oui-flex oui-items-center oui-justify-start oui-gap-1"
              >
                <ChainIcon chainId={item.id} size="2xs" />
                <div>{item.name}</div>
              </div>
            ))}
          </div>
        </div>
      }
      arrow={true}
      contentProps={{
        side: "bottom",
        align: "center",
        className: "oui-p-2 oui-z-[65]",
      }}
    >
      <button>{children}</button>
    </Popover>
  );
}
