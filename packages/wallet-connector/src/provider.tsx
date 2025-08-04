import React, { type PropsWithChildren } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { EMPTY_OBJECT } from "@orderly.network/types";
import { SolanaProvider } from "./SolanaProvider";
import { InitEvm } from "./initEvm";
import { Main } from "./main";
import { EvmInitialProps, SolanaInitialProps } from "./types";

export interface WalletConnectorProviderProps {
  solanaInitial?: SolanaInitialProps;
  evmInitial?: EvmInitialProps;
}

export const WalletConnectorProvider: React.FC<
  PropsWithChildren<WalletConnectorProviderProps>
> = (props) => {
  return (
    <SolanaProvider {...(props.solanaInitial ?? EMPTY_OBJECT)}>
      <InitEvm {...(props.evmInitial ?? EMPTY_OBJECT)}>
        <Main
          solanaNetwork={
            props.solanaInitial?.network ?? WalletAdapterNetwork.Devnet
          }
        >
          {props.children}
        </Main>
      </InitEvm>
    </SolanaProvider>
  );
};
