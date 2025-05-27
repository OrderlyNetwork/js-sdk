import React, { PropsWithChildren, useMemo, useState } from "react";
import { AbstractWalletProvider } from "@abstract-foundation/agw-react";
// Use abstract for mainnet
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { abstractTestnet, abstract } from "viem/chains";
import { useWalletConnectorPrivy } from "../../provider";
import { Network } from "../../types";

export const InitAbstractProvider = (props: PropsWithChildren) => {
  const [queryClient] = useState(() => new QueryClient());
  const { network } = useWalletConnectorPrivy();
  const chain = useMemo(() => {
    if (network === Network.mainnet) {
      return abstract;
    }
    return abstractTestnet;
  }, [network]);
  return (
    <AbstractWalletProvider chain={chain} queryClient={queryClient}>
      {props.children}
    </AbstractWalletProvider>
  );
};
