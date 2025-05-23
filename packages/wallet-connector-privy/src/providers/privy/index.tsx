import React from "react";
import { PropsWithChildren } from "react";
import { Chain } from "viem/chains";
import { InitPrivy } from "../../types";
import { InitPrivyProvider } from "./initPrivyProvider";
import { PrivyWalletProvider } from "./privyWalletProvider";

export function PrivyWallet(
  props: PropsWithChildren<{ privyConfig?: InitPrivy; initChains: Chain[] }>,
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
