import React, { PropsWithChildren } from "react";
import { Chain } from "viem/chains";
import { InitWagmi } from "../../types";
import { InitWagmiProvider } from "./initWagmiProvider";
import { WagmiWalletProvider } from "./wagmiWalletProvider";

export function WagmiWallet(props: {
  children: React.ReactNode;
  wagmiConfig?: InitWagmi;
  initChains: Chain[];
}) {
  return (
    <InitWagmiProvider
      wagmiConfig={props.wagmiConfig ?? {}}
      initChains={props.initChains}
    >
      <WagmiWalletProvider>{props.children}</WagmiWalletProvider>
    </InitWagmiProvider>
  );
}
