import React from "react";
import { Chain } from "viem/chains";
import { EMPTY_OBJECT } from "@kodiak-finance/orderly-types";
import { InitWagmi } from "../../types";
import { InitWagmiProvider } from "./initWagmiProvider";
import { WagmiWalletProvider } from "./wagmiWalletProvider";

export const WagmiWallet: React.FC<
  React.PropsWithChildren<{ wagmiConfig?: InitWagmi; initChains: Chain[] }>
> = (props) => {
  return (
    <InitWagmiProvider
      initChains={props.initChains}
      wagmiConfig={props.wagmiConfig ?? EMPTY_OBJECT}
    >
      <WagmiWalletProvider>{props.children}</WagmiWalletProvider>
    </InitWagmiProvider>
  );
};
