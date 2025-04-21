import { InitWagmi } from "../../types";
import { WagmiWalletProvider } from "./wagmiWalletProvider";
import { InitWagmiProvider } from "./initWagmiProvider";
import { Chain } from "viem/chains";
import React, { PropsWithChildren } from "react";

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
