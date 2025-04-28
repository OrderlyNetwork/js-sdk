import React, { PropsWithChildren, useState } from "react";
import { AbstractWalletProvider } from "@abstract-foundation/agw-react";
import { abstractTestnet, abstract } from "viem/chains"; // Use abstract for mainnet
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const InitAbstractProvider = (props: PropsWithChildren) => {
  const [queryClient] = useState(() => new QueryClient());
  return (
      <AbstractWalletProvider chain={abstractTestnet} queryClient={queryClient}>
        {props.children}
      </AbstractWalletProvider>
  );
};
