import React from "react";
import { PropsWithChildren } from "react";
import { PrivyWalletProvider } from "./privyWalletProvider";
import { InitPrivyProvider } from "./initPrivyProvider";
import { InitPrivy } from "../../types";
import { Chain } from "viem/chains";

export function PrivyWallet(
  props: PropsWithChildren<{ privyConfig?: InitPrivy; initChains: Chain[] }>
) {
  return (
    <InitPrivyProvider
      privyConfig={props.privyConfig}
      initChains={props.initChains}
    >
      <PrivyWalletProvider>{props.children}</PrivyWalletProvider>
    </InitPrivyProvider>
  );
}
