import React from "react";
import { getWalletIcon } from "../util";
import { Connector } from "wagmi";
import { cn } from "@orderly.network/ui";
import { WalletAdapter } from "@solana/wallet-adapter-base";
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
            : "oui-w-[18px] oui-h-[18px]"
        )}
        src={icon}
        alt={connector.name}
      />
    </div>
  );
}
