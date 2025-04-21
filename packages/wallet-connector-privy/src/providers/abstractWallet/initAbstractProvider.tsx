import React, { PropsWithChildren } from "react";
import { AbstractWalletProvider } from "@abstract-foundation/agw-react";
import { abstractTestnet, abstract } from "viem/chains"; // Use abstract for mainnet

export const InitAbstractProvider = (props: PropsWithChildren) => {
  return (
    <AbstractWalletProvider chain={abstractTestnet}>
      {props.children}
    </AbstractWalletProvider>
  );
};
