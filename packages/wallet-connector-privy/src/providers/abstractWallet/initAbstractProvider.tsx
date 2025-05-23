import React, { PropsWithChildren, useState } from "react";
import { AbstractWalletProvider } from "@abstract-foundation/agw-react";
// Use abstract for mainnet
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { abstractTestnet, abstract } from "viem/chains";

export const InitAbstractProvider = (props: PropsWithChildren) => {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <AbstractWalletProvider chain={abstractTestnet} queryClient={queryClient}>
      {props.children}
    </AbstractWalletProvider>
  );
};
