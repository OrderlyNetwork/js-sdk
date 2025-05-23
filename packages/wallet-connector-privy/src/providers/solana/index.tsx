import React, { PropsWithChildren } from "react";
import { InitSolana } from "../../types";
import { InitSolanaProvider } from "./initSolanaProvider";
import { SolanaWalletProvider } from "./solanaWalletProvider";

export function SolanaWallet(props: {
  children: React.ReactNode;
  solanaConfig?: InitSolana;
}) {
  return (
    <InitSolanaProvider
      {...(props.solanaConfig ?? { wallets: [], onError: () => {} })}
    >
      <SolanaWalletProvider>{props.children}</SolanaWalletProvider>
    </InitSolanaProvider>
  );
}
